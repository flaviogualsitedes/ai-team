import Database from 'better-sqlite3';
import path from 'path';
import os from 'os';
import { Vault } from '../../../src/core/vault';
import { MODELS } from '../../../src/llm/models';

let db: Database.Database | null = null;

/**
 * Obtém a instância do banco de dados SQLite do projeto.
 */
export function getDb() {
  if (db) return db;
  const dbPath = path.join(os.homedir(), '.aiteam', 'aiteam.db');
  db = new Database(dbPath);
  return db;
}

/**
 * Tipagem para as estatísticas globais e por provedor
 */
export interface DashboardStats {
  totalExecutions: number;
  totalAgents: number;
  totalSquads: number;
  totalTokens: number;
  totalCost: number;
  providerStats: Array<{
    provider: string;
    model: string;
    tokens: number;
    cost: number;
  }>;
}

/**
 * Busca estatísticas rápidas para o dashboard
 */
export function getDashboardStats(): DashboardStats {
  const database = getDb();
  const executions = database.prepare('SELECT COUNT(*) as count, SUM(total_tokens) as tokens, SUM(total_cost_usd) as cost FROM executions').get() as any;
  const agents = database.prepare('SELECT COUNT(*) as count FROM agents').get() as any;
  const squads = database.prepare('SELECT COUNT(*) as count FROM squads').get() as any;
  
  // Buscar estatísticas por modelo nas etapas
  const stepStats = database.prepare(`
    SELECT model_id as modelId, SUM(tokens_used) as tokens, SUM(cost_usd) as cost 
    FROM execution_steps 
    GROUP BY model_id
  `).all() as any[];

  // Agrupar por provedor
  const providerMap: Record<string, any> = {};
  
  stepStats.forEach(stat => {
    const modelInfo = MODELS.find(m => m.modelId === stat.modelId || m.id === stat.modelId);
    const provider = modelInfo?.provider || 'unknown';
    
    if (!providerMap[provider]) {
      providerMap[provider] = { provider, tokens: 0, cost: 0, model: '' };
    }
    
    providerMap[provider].tokens += stat.tokens || 0;
    providerMap[provider].cost += stat.cost || 0;
    if (!providerMap[provider].model) providerMap[provider].model = modelInfo?.name || '---';
  });

  // Complementar com provedores ativos (com chave) que ainda não tem execução
  const apiKeys = getApiKeys();
  apiKeys.forEach(k => {
    if (!providerMap[k.provider]) {
      const providerModel = MODELS.find(m => m.provider === k.provider);
      providerMap[k.provider] = { 
        provider: k.provider, 
        tokens: 0, 
        cost: 0, 
        model: providerModel?.name || '---' 
      };
    }
  });

  return {
    totalExecutions: executions?.count || 0,
    totalAgents: agents?.count || 0,
    totalSquads: squads?.count || 0,
    totalTokens: executions?.tokens || 0,
    totalCost: executions?.cost || 0,
    providerStats: Object.values(providerMap)
  };
}

// ========================================
// AGENTES
// ========================================

export function getAgents() {
  const database = getDb();
  return database.prepare(`
    SELECT id, name, role, personality, model, created_at as createdAt 
    FROM agents ORDER BY name ASC
  `).all() as any[];
}

export function getAgentDetails(id: string) {
  const database = getDb();
  return database.prepare(`
    SELECT id, name, role, personality, system_prompt as systemPrompt, model, 
    temperature, max_tokens as maxTokens, created_at as createdAt, updated_at as updatedAt 
    FROM agents WHERE id = ?
  `).get(id) as any;
}

export function updateAgent(id: string, data: any) {
  const database = getDb();
  const sets = Object.keys(data)
    .map(key => `${key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)} = ?`)
    .join(', ');
  const values = [...Object.values(data), id];
  return database.prepare(`UPDATE agents SET ${sets}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...values);
}

// ========================================
// SQUADS & RECRUTAMENTO
// ========================================

export function getSquads() {
  const database = getDb();
  return database.prepare(`
    SELECT s.id, s.name, s.description, s.pipeline,
    (SELECT COUNT(*) FROM squad_members WHERE squad_id = s.id) as memberCount,
    s.created_at as createdAt FROM squads s ORDER BY s.name ASC
  `).all() as any[];
}

export function getSquadDetails(id: string) {
  const database = getDb();
  const squad = database.prepare('SELECT * FROM squads WHERE id = ?').get(id) as any;
  if (!squad) return null;

  const members = database.prepare(`
    SELECT m.agent_id as agentId, m.position, m.role_in_squad as roleInSquad, m.prompt_override as promptOverride,
    a.name, a.role as baseRole, a.model
    FROM squad_members m JOIN agents a ON m.agent_id = a.id
    WHERE m.squad_id = ? ORDER BY m.position ASC
  `).all(id) as any[];

  return { ...squad, members };
}

export function addMemberToSquad(squadId: string, agentId: string, position: number) {
  const database = getDb();
  return database.prepare('INSERT INTO squad_members (squad_id, agent_id, position) VALUES (?, ?, ?)').run(squadId, agentId, position);
}

export function removeMemberFromSquad(squadId: string, agentId: string) {
  const database = getDb();
  return database.prepare('DELETE FROM squad_members WHERE squad_id = ? AND agent_id = ?').run(squadId, agentId);
}

// ========================================
// EXECUÇÕES
// ========================================

export function getExecutions() {
  const database = getDb();
  return database.prepare(`
    SELECT e.id, e.status, e.total_tokens as totalTokens, e.total_cost_usd as totalCostUsd, e.duration_ms as durationMs,
    e.created_at as createdAt, s.name as squadName, p.name as projectName, p.path as projectPath
    FROM executions e JOIN squads s ON e.squad_id = s.id JOIN projects p ON e.project_id = p.id
    ORDER BY e.created_at DESC LIMIT 50
  `).all() as any[];
}

export function getExecutionDetails(id: string) {
  const database = getDb();
  const execution = database.prepare(`
    SELECT e.id, e.status, e.total_tokens as totalTokens, e.total_cost_usd as totalCostUsd, e.duration_ms as durationMs,
    e.created_at as createdAt, e.completed_at as completedAt, s.name as squadName, s.description as squadDescription
    FROM executions e JOIN squads s ON e.squad_id = s.id WHERE e.id = ?
  `).get(id) as any;

  if (!execution) return null;

  const steps = database.prepare(`
    SELECT es.*, a.name as agentName, a.role as agentRole
    FROM execution_steps es JOIN agents a ON es.agent_id = a.id
    WHERE es.execution_id = ? ORDER BY es.step_number ASC
  `).all(id) as any[];

  return {
    ...execution,
    steps: steps.map(s => ({ ...s, tokensUsed: s.tokens_used, costUsd: s.cost_usd, durationMs: s.duration_ms }))
  };
}

// ========================================
// CONFIGURAÇÕES & VAULT
// ========================================

export function getApiKeys() {
  const database = getDb();
  const rows = database.prepare('SELECT provider, api_key as apiKey, created_at as createdAt FROM api_keys').all() as any[];
  
  return rows.map(row => {
    try {
      const decrypted = row.apiKey && row.apiKey.includes(':') ? Vault.decrypt(row.apiKey) : row.apiKey;
      return { ...row, apiKey: decrypted };
    } catch (e) {
      return { ...row, apiKey: row.apiKey };
    }
  });
}

export function saveApiKey(provider: string, apiKey: string) {
  const database = getDb();
  const encryptedKey = Vault.encrypt(apiKey);
  
  return database.prepare(`
    INSERT INTO api_keys (provider, api_key, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(provider) DO UPDATE SET 
      api_key = excluded.api_key,
      updated_at = CURRENT_TIMESTAMP
  `).run(provider, encryptedKey);
}

export function getSettings() {
  const database = getDb();
  const rows = database.prepare('SELECT key, value FROM settings').all() as any[];
  return rows.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {}) as Record<string, string>;
}

export function updateSetting(key: string, value: string) {
  const database = getDb();
  return database.prepare(`
    INSERT INTO settings (key, value, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(key) DO UPDATE SET 
      value = excluded.value,
      updated_at = CURRENT_TIMESTAMP
  `).run(key, value);
}

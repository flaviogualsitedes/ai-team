/**
 * Schema completo do banco de dados SQLite do AITeam.
 *
 * Define todas as tabelas, índices e relações necessárias.
 * O schema suporta:
 * - Relações N:N entre agentes, squads e projetos
 * - Memória em 3 camadas (pessoal, projeto, execução)
 * - Fonte da verdade hierárquica (4 níveis)
 * - Vault criptografado
 * - Rules, guardrails, artefatos
 * - Logs detalhados de skills e erros
 */

import type Database from 'better-sqlite3';

/**
 * Executa todas as migrações do schema.
 * Utiliza user_version do SQLite para controle de versão.
 */
export function runMigrations(db: Database.Database): void {
  const currentVersion = db.pragma('user_version', { simple: true }) as number;

  if (currentVersion < 1) {
    migrateV1(db);
    db.pragma('user_version = 1');
  }

  if (currentVersion < 2) {
    migrateV2(db);
    db.pragma('user_version = 2');
  }
}

/**
 * Migração v2 — Modelos por passo e Orçamentos.
 */
function migrateV2(db: Database.Database): void {
  db.exec(`
    -- Adicionar modelo usado no passo
    ALTER TABLE execution_steps ADD COLUMN model_id TEXT;
    
    -- Adicionar orçamentos no projeto
    ALTER TABLE projects ADD COLUMN token_budget INTEGER DEFAULT 1000000; -- 1M default
    ALTER TABLE projects ADD COLUMN cost_budget_usd REAL DEFAULT 10.0;     -- $10 default
  `);
}

/**
 * Migração v1 — Schema inicial completo.
 */
function migrateV1(db: Database.Database): void {
  db.exec(`
    -- ========================================
    -- PROJETOS
    -- ========================================
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      path TEXT NOT NULL UNIQUE,
      description TEXT,
      language TEXT NOT NULL DEFAULT 'pt-BR',
      user_name TEXT,
      default_model TEXT DEFAULT 'gemini-3-flash',
      ides TEXT,
      company_context_path TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- ========================================
    -- AGENTES (globais — não pertencem a um projeto)
    -- ========================================
    CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL,
      system_prompt TEXT,
      model TEXT DEFAULT 'gemini-3-flash',
      temperature REAL DEFAULT 0.7,
      max_tokens INTEGER DEFAULT 4096,
      personality TEXT,
      tools TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- ========================================
    -- SQUADS (globais — podem ser usados em vários projetos)
    -- ========================================
    CREATE TABLE IF NOT EXISTS squads (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      pipeline TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- ========================================
    -- JUNCTION: Membros de um Squad (N:N com posição)
    -- ========================================
    CREATE TABLE IF NOT EXISTS squad_members (
      squad_id TEXT NOT NULL REFERENCES squads(id) ON DELETE CASCADE,
      agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
      position INTEGER NOT NULL,
      role_in_squad TEXT,
      checkpoint INTEGER DEFAULT 0,
      PRIMARY KEY(squad_id, agent_id)
    );

    -- ========================================
    -- JUNCTION: Squads alocados em Projetos (N:N)
    -- ========================================
    CREATE TABLE IF NOT EXISTS project_squads (
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      squad_id TEXT NOT NULL REFERENCES squads(id) ON DELETE CASCADE,
      config_overrides TEXT,
      enabled INTEGER DEFAULT 1,
      assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY(project_id, squad_id)
    );

    -- ========================================
    -- JUNCTION: Agentes com acesso a Projetos (N:N)
    -- ========================================
    CREATE TABLE IF NOT EXISTS project_agents (
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
      config_overrides TEXT,
      PRIMARY KEY(project_id, agent_id)
    );

    -- ========================================
    -- EXECUÇÕES
    -- ========================================
    CREATE TABLE IF NOT EXISTS executions (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id),
      squad_id TEXT NOT NULL REFERENCES squads(id),
      status TEXT NOT NULL DEFAULT 'pending',
      total_tokens INTEGER DEFAULT 0,
      total_cost_usd REAL DEFAULT 0.0,
      duration_ms INTEGER DEFAULT 0,
      rated_score INTEGER,
      rated_feedback TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS execution_steps (
      id TEXT PRIMARY KEY,
      execution_id TEXT NOT NULL REFERENCES executions(id) ON DELETE CASCADE,
      agent_id TEXT NOT NULL REFERENCES agents(id),
      step_number INTEGER NOT NULL,
      input_summary TEXT,
      output_summary TEXT,
      output_full TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      tokens_used INTEGER DEFAULT 0,
      cost_usd REAL DEFAULT 0.0,
      duration_ms INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- ========================================
    -- INTERAÇÕES ENTRE AGENTES
    -- ========================================
    CREATE TABLE IF NOT EXISTS agent_interactions (
      id TEXT PRIMARY KEY,
      execution_id TEXT NOT NULL REFERENCES executions(id) ON DELETE CASCADE,
      from_agent_id TEXT NOT NULL REFERENCES agents(id),
      to_agent_id TEXT NOT NULL REFERENCES agents(id),
      type TEXT NOT NULL,
      message TEXT,
      response TEXT,
      duration_ms INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- ========================================
    -- MEMÓRIAS (3 camadas)
    -- ========================================
    CREATE TABLE IF NOT EXISTS memories (
      id TEXT PRIMARY KEY,
      owner_type TEXT NOT NULL,
      owner_id TEXT NOT NULL,
      layer TEXT NOT NULL,
      project_id TEXT,
      category TEXT NOT NULL,
      content TEXT NOT NULL,
      is_abstract INTEGER DEFAULT 0,
      source_project_id TEXT,
      relevance_score REAL DEFAULT 1.0,
      access_count INTEGER DEFAULT 0,
      last_accessed_at DATETIME,
      expires_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_memories_owner ON memories(owner_type, owner_id);
    CREATE INDEX IF NOT EXISTS idx_memories_layer ON memories(layer, project_id);

    -- ========================================
    -- RULES
    -- ========================================
    CREATE TABLE IF NOT EXISTS rules (
      id TEXT PRIMARY KEY,
      project_id TEXT,
      name TEXT NOT NULL,
      description TEXT,
      content TEXT NOT NULL,
      type TEXT NOT NULL,
      scope TEXT DEFAULT 'all',
      priority INTEGER DEFAULT 0,
      enabled INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- ========================================
    -- GUARDRAILS
    -- ========================================
    CREATE TABLE IF NOT EXISTS guardrails (
      id TEXT PRIMARY KEY,
      project_id TEXT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      config TEXT NOT NULL,
      action TEXT DEFAULT 'warn',
      enabled INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- ========================================
    -- VAULT (credenciais criptografadas)
    -- ========================================
    CREATE TABLE IF NOT EXISTS vault (
      id TEXT PRIMARY KEY,
      project_id TEXT,
      name TEXT NOT NULL,
      category TEXT,
      encrypted_value BLOB NOT NULL,
      iv BLOB NOT NULL,
      metadata TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(project_id, name)
    );

    -- ========================================
    -- API KEYS (global)
    -- ========================================
    CREATE TABLE IF NOT EXISTS api_keys (
      provider TEXT PRIMARY KEY,
      api_key TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- ========================================
    -- BIBLIOTECA DE CONHECIMENTO
    -- ========================================
    CREATE TABLE IF NOT EXISTS knowledge (
      id TEXT PRIMARY KEY,
      project_id TEXT,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      source_url TEXT,
      source_file TEXT,
      tags TEXT,
      pinned INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- ========================================
    -- AVALIAÇÕES (gamificação)
    -- ========================================
    CREATE TABLE IF NOT EXISTS ratings (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      execution_id TEXT,
      score INTEGER NOT NULL,
      feedback TEXT,
      rated_by TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- ========================================
    -- LOGS DE USO DE SKILLS
    -- ========================================
    CREATE TABLE IF NOT EXISTS skill_usage_logs (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      execution_id TEXT NOT NULL,
      agent_id TEXT NOT NULL,
      skill_id TEXT NOT NULL,
      squad_id TEXT,
      input_summary TEXT,
      output_summary TEXT,
      success INTEGER DEFAULT 1,
      duration_ms INTEGER,
      tokens_used INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_skill_usage_agent ON skill_usage_logs(agent_id, skill_id);

    -- ========================================
    -- LOGS DE ERROS
    -- ========================================
    CREATE TABLE IF NOT EXISTS error_logs (
      id TEXT PRIMARY KEY,
      project_id TEXT,
      execution_id TEXT,
      agent_id TEXT,
      skill_id TEXT,
      error_type TEXT NOT NULL,
      error_code TEXT,
      message TEXT NOT NULL,
      stack_trace TEXT,
      context TEXT,
      resolved INTEGER DEFAULT 0,
      resolution TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- ========================================
    -- ARTEFATOS
    -- ========================================
    CREATE TABLE IF NOT EXISTS artifacts (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      execution_id TEXT REFERENCES executions(id),
      agent_id TEXT REFERENCES agents(id),
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      file_path TEXT,
      content TEXT,
      metadata TEXT,
      pinned INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- ========================================
    -- EXEMPLOS (acertos e erros)
    -- ========================================
    CREATE TABLE IF NOT EXISTS examples (
      id TEXT PRIMARY KEY,
      project_id TEXT,
      type TEXT NOT NULL,
      category TEXT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      correction TEXT,
      tags TEXT,
      source_execution_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- ========================================
    -- ESTILOS
    -- ========================================
    CREATE TABLE IF NOT EXISTS styles (
      id TEXT PRIMARY KEY,
      project_id TEXT,
      name TEXT NOT NULL,
      description TEXT,
      content TEXT NOT NULL,
      type TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- ========================================
    -- FONTE DA VERDADE (configuração hierárquica)
    -- ========================================
    CREATE TABLE IF NOT EXISTS truth_config (
      id TEXT PRIMARY KEY,
      scope_type TEXT NOT NULL,
      scope_id TEXT,
      project_id TEXT,
      key TEXT NOT NULL,
      value TEXT NOT NULL,
      source TEXT DEFAULT 'system',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(scope_type, scope_id, project_id, key)
    );
  `);
}

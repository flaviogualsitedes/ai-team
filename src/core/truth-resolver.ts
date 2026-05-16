/**
 * Truth Resolver (Resolvido da Fonte da Verdade).
 *
 * Consolida as configurações e contextos em diferentes níveis:
 * Global -> Projeto -> Squad -> Agente.
 */

import { getDatabase } from '../db/index.js';
import fs from 'node:fs';
import { Vault } from './vault.js';
import { MODELS } from '../llm/models.js';

export interface ResolvedContext {
  systemPrompt: string;
  model: string;
  apiKey: string;
  provider: string;
}

export class TruthResolver {
  private db = getDatabase();

  /**
   * Resolve o contexto completo para um agente específico em um projeto,
   * opcionalmente considerando o contexto de uma Squad específica.
   */
  async resolveAgentContext(projectId: string, agentId: string, squadId?: string): Promise<ResolvedContext> {
    // 1. Buscar Dados do Banco
    const project = this.db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId) as any;
    const agent = this.db.prepare('SELECT * FROM agents WHERE id = ?').get(agentId) as any;

    if (!project || !agent) {
      throw new Error('Projeto ou Agente não encontrado para resolução de contexto.');
    }

    // 2. Buscar Overrides de Squad (Se aplicável)
    let squadInstructions = '';
    let promptOverride = '';
    
    if (squadId) {
      const squad = this.db.prepare('SELECT * FROM squads WHERE id = ?').get(squadId) as any;
      const membership = this.db.prepare('SELECT * FROM squad_members WHERE squad_id = ? AND agent_id = ?').get(squadId, agentId) as any;
      
      if (squad) {
        squadInstructions = `\n# DIRETRIZES DA SQUAD: ${squad.name.toUpperCase()}\n${squad.description || 'Foco total na execução do pipeline definido.'}\n`;
      }
      
      if (membership && membership.prompt_override) {
        promptOverride = `\n# ESPECIFICAÇÃO DE RECRUTAMENTO (OVERRIDE)\n${membership.prompt_override}\n`;
      }
    }

    // 3. Carregar Contexto da Empresa (Markdown)
    let companyContext = '';
    if (project.company_context_path && fs.existsSync(project.company_context_path)) {
      companyContext = fs.readFileSync(project.company_context_path, 'utf-8');
    }

    // 1. Buscar chaves e configurações globais
    const settingsRows = this.db.prepare('SELECT key, value FROM settings').all() as any[];
    const settings = settingsRows.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {}) as any;

    const provider = settings.default_provider || 'google';
    const fallbackModel = settings.default_model || (provider === 'google' ? 'gemini-1.5-flash' : 'gpt-4o');

    // 5. Montar System Prompt Hierárquico
    const systemPrompt = [
      '# DIRETRIZES GLOBAIS (AITeam System)',
      'Você é um membro de uma squad de elite de agentes autônomos.',
      'Siga rigorosamente as instruções e mantenha o foco no seu papel.',
      '',
      '# CONTEXTO DO PROJETO',
      `Nome: ${project.name}`,
      `Idioma: ${project.language}`,
      '',
      '# CONTEXTO DA EMPRESA',
      companyContext || 'Empresa em estágio inicial de configuração.',
      squadInstructions,
      '',
      '# SUA IDENTIDADE E PAPEL BASE',
      `Nome: ${agent.name}`,
      `Função: ${agent.role}`,
      `Personalidade: ${agent.personality || 'Profissional e eficiente.'}`,
      agent.system_prompt ? `\n# INSTRUÇÕES MESTRE (BASE)\n${agent.system_prompt}` : '',
      promptOverride,
      '',
      '# REGRAS DE EXECUÇÃO',
      '- Responda apenas o necessário para cumprir sua tarefa.',
      '- Se houver um passo anterior no pipeline, use-o como base.',
      '- Não invente informações fora do contexto fornecido.',
      '- Se você usar ferramentas (Skills), SEMPRE finalize sua resposta com um resumo textual claro do que foi realizado.',
    ].join('\n');

    const finalModel = agent.model || fallbackModel;
    const finalProvider = this.getProviderFromModel(finalModel);
    
    // Buscar a chave do provedor real
    const finalKeyRecord = this.db.prepare('SELECT api_key FROM api_keys WHERE provider = ?').get(finalProvider) as any;

    if (!finalKeyRecord) {
      throw new Error(`API Key para o provedor '${finalProvider}' não encontrada (exigida pelo modelo ${finalModel}).`);
    }

    return {
      systemPrompt,
      model: finalModel,
      apiKey: Vault.decrypt(finalKeyRecord.api_key),
      provider: finalProvider,
    };
  }

  /**
   * Identifica o provedor com base no catálogo técnico centralizado.
   */
  private getProviderFromModel(modelId: string): string {
    const modelConfig = MODELS.find(m => m.id === modelId);
    if (modelConfig) return modelConfig.provider;

    // Fallbacks inteligentes baseados em prefixos
    if (modelId.includes('gemini')) return 'google';
    if (modelId.includes('claude')) return 'anthropic';
    if (modelId.includes('gpt')) return 'openai';
    if (modelId.includes('llama') || modelId.includes('mixtral')) return 'groq';
    
    return 'google'; // Default
  }
}

/**
 * Truth Resolver (Resolvido da Fonte da Verdade).
 *
 * Consolida as configurações e contextos em diferentes níveis:
 * Global -> Projeto -> Squad -> Agente.
 */

import { getDatabase } from '../db/index.js';
import fs from 'node:fs';
import { Vault } from './vault.js';

export interface ResolvedContext {
  systemPrompt: string;
  model: string;
  apiKey: string;
}

export class TruthResolver {
  private db = getDatabase();

  /**
   * Resolve o contexto completo para um agente específico em um projeto.
   */
  async resolveAgentContext(projectId: string, agentId: string): Promise<ResolvedContext> {
    // 1. Buscar Dados do Banco
    const project = this.db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId) as any;
    const agent = this.db.prepare('SELECT * FROM agents WHERE id = ?').get(agentId) as any;

    if (!project || !agent) {
      throw new Error('Projeto ou Agente não encontrado para resolução de contexto.');
    }

    // 2. Carregar Contexto da Empresa (Markdown)
    let companyContext = '';
    if (project.company_context_path && fs.existsSync(project.company_context_path)) {
      companyContext = fs.readFileSync(project.company_context_path, 'utf-8');
    }

    // 3. Buscar API Key
    const provider = this.getProviderFromModel(agent.model);
    const keyRecord = this.db.prepare('SELECT api_key FROM api_keys WHERE provider = ?').get(provider) as any;
    
    if (!keyRecord) {
      throw new Error(`API Key para o provedor '${provider}' não encontrada. Use 'aiteam config set-key ${provider}'.`);
    }

    // 4. Montar System Prompt Hierárquico
    const systemPrompt = [
      '# DIRETRIZES GLOBAIS (AITeam)',
      'Você é um membro de uma squad de elite de agentes autônomos.',
      'Siga rigorosamente as instruções e mantenha o foco no seu papel.',
      '',
      '# CONTEXTO DA EMPRESA',
      companyContext || 'Empresa em estágio inicial de configuração.',
      '',
      '# OBJETIVO DO PROJETO',
      `Projeto: ${project.name}`,
      `Idioma: ${project.language}`,
      '',
      '# SUA IDENTIDADE E PAPEL',
      `Nome: ${agent.name}`,
      `Função: ${agent.role}`,
      `Personalidade: ${agent.personality || 'Profissional e eficiente.'}`,
      '',
      '# REGRAS DE EXECUÇÃO',
      '- Responda apenas o necessário para cumprir sua tarefa.',
      '- Se houver um passo anterior no pipeline, use-o como base.',
      '- Não invente informações fora do contexto fornecido.',
    ].join('\n');

    return {
      systemPrompt,
      model: agent.model,
      apiKey: Vault.decrypt(keyRecord.api_key),
    };
  }

  /**
   * Identifica o provedor com base no prefixo/id do modelo.
   */
  private getProviderFromModel(modelId: string): string {
    if (modelId.includes('gemini')) return 'google';
    if (modelId.includes('claude')) return 'anthropic';
    if (modelId.includes('gpt')) return 'openai';
    return 'google'; // Default
  }
}

/**
 * Orquestrador do AITeam.
 *
 * Responsável por executar o pipeline de um squad, gerenciar o fluxo de dados
 * entre agentes, aplicar regras/guardrails e persistir logs de execução.
 */

import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGroq } from '@ai-sdk/groq';
import chalk from 'chalk';
import ora from 'ora';
import { t } from '../i18n/index.js';
import { getDatabase } from '../db/index.js';
import { getModelById } from '../llm/models.js';
import { nanoid } from 'nanoid';
import { TruthResolver } from './truth-resolver.js';
import { getToolsForSDK } from '../skills/index.js';

export interface ExecutionOptions {
  projectId: string;
  squadId: string;
  initialTask?: string;
  dryRun?: boolean;
  onStepStart?: (agentName: string, model: string) => void;
  onStepComplete?: (data: { duration: number; tokens: number }) => void;
}

export class Orchestrator {
  private db = getDatabase();

  /**
   * Executa um squad completo.
   */
  async runSquad(options: ExecutionOptions): Promise<void> {
    const { projectId, squadId, dryRun } = options;

    // 1. Carregar Squad e Membros
    const squad = this.db.prepare('SELECT * FROM squads WHERE id = ?').get(squadId) as any;
    const members = this.db.prepare(`
      SELECT a.*, sm.position, sm.checkpoint 
      FROM agents a
      JOIN squad_members sm ON a.id = sm.agent_id
      WHERE sm.squad_id = ?
      ORDER BY sm.position ASC
    `).all(squadId) as any[];

    if (dryRun) {
      this.showDryRun(squad, members);
      return;
    }

    console.log(`\n${t('executionStarted', { name: chalk.bold(squad.name) })}\n`);

    const executionId = nanoid();
    this.db.prepare(`
      INSERT INTO executions (id, project_id, squad_id, status)
      VALUES (?, ?, ?, 'running')
    `).run(executionId, projectId, squadId);

    const resolver = new TruthResolver();
    let lastOutput = 'Nenhum passo anterior.';
    let totalTokens = 0;
    let totalCostUsd = 0;
    const startTime = Date.now();

    try {
      for (const [index, agent] of members.entries()) {
        const stepStartTime = Date.now();
        const modelConfig = getModelById(agent.model);
        
        // Resolver contexto (Prompt do Sistema + API Key + Provedor)
        const context = await resolver.resolveAgentContext(projectId, agent.id);

        if (options.onStepStart) {
          options.onStepStart(agent.name, modelConfig?.name || agent.model);
        }

        // Configurar Provedor Dinamicamente
        let providerInstance;
        const actualModelId = modelConfig?.modelId || context.model;

        if (context.provider === 'google') {
          providerInstance = createGoogleGenerativeAI({ apiKey: context.apiKey })(actualModelId);
        } else if (context.provider === 'openai') {
          providerInstance = createOpenAI({ apiKey: context.apiKey })(actualModelId);
        } else if (context.provider === 'anthropic') {
          providerInstance = createAnthropic({ apiKey: context.apiKey })(actualModelId);
        } else if (context.provider === 'groq') {
          providerInstance = createGroq({ apiKey: context.apiKey })(actualModelId);
        } else {
          throw new Error(`Provedor '${context.provider}' não suportado pelo Orquestrador.`);
        }

        // Definir a tarefa
        const prompt = (index === 0 && options.initialTask)
          ? `SUA MISSÃO INICIAL:\n${options.initialTask}`
          : `CONTEXTO DO PASSO ANTERIOR:\n${lastOutput}\n\nSUA TAREFA: Processe as informações acima e continue o trabalho.`;

        const stepId = nanoid();

        // Execução Real
        const result = await generateText({
          model: providerInstance,
          system: context.systemPrompt,
          prompt,
          tools: getToolsForSDK(),
          maxSteps: 5,
        });

        // Consolidar texto de todos os passos
        let text = result.text;
        
        if (!text || text.trim().length === 0) {
          text = result.steps
            .flatMap(s => s.content)
            .filter(part => part.type === 'text')
            .map(part => (part as any).text)
            .filter(t => t && t.trim().length > 0)
            .join('\n\n');
        }

        if (!text || text.trim().length === 0) {
          const toolData = result.steps
            .flatMap(s => (s as any).content || [])
            .filter(p => p.type === 'tool-result')
            .map(tr => {
              const res = (tr as any).result || (tr as any).output;
              const finalVal = (res && typeof res === 'object' && 'value' in res) ? res.value : res;
              return `[Skill: ${(tr as any).toolName}]\n${typeof finalVal === 'object' ? JSON.stringify(finalVal, null, 2) : finalVal}`;
            })
            .join('\n\n');
          
          if (toolData) {
            text = `O agente executou ferramentas mas não gerou um resumo. Resultados brutos:\n\n${toolData}`;
          }
        }

        const usage = result.usage;
        const duration = (Date.now() - stepStartTime) / 1000;
        const tokens = usage.totalTokens;
        const stepCost = (tokens / 1000) * (modelConfig?.costPer1kTokens || 0);

        // Salvar Passo no Banco
        this.db.prepare(`
          INSERT INTO execution_steps (id, execution_id, agent_id, step_number, output_full, status, tokens_used, cost_usd, model_id, duration_ms)
          VALUES (?, ?, ?, ?, ?, 'completed', ?, ?, ?, ?)
        `).run(stepId, executionId, agent.id, index + 1, text, tokens, stepCost, actualModelId, duration * 1000);

        lastOutput = text;
        totalTokens += tokens;
        totalCostUsd += stepCost;

        if (options.onStepComplete) {
          options.onStepComplete({ duration, tokens });
        }
      }

      // Finalizar Execução
      const totalDuration = Date.now() - startTime;
      this.db.prepare(`
        UPDATE executions 
        SET status = 'completed', total_tokens = ?, total_cost_usd = ?, duration_ms = ?, completed_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(totalTokens, totalCostUsd, totalDuration, executionId);

      console.log(`\n${t('executionComplete', { 
        duration: (totalDuration / 1000).toFixed(1), 
        tokens: totalTokens.toString(),
        cost: totalCostUsd.toFixed(4) 
      })}\n`);

    } catch (error) {
      this.db.prepare("UPDATE executions SET status = 'failed' WHERE id = ?").run(executionId);
      throw error;
    }
  }

  /**
   * Exibe o preview da execução (Dry-run).
   */
  private showDryRun(squad: any, members: any[]): void {
    console.log(`\n${chalk.bold.cyan(t('dryRunTitle'))}`);
    console.log(`${chalk.dim(squad.description)}\n`);

    members.forEach((m, i) => {
      console.log(t('dryRunStep', {
        position: (i + 1).toString(),
        agent: chalk.yellow(m.name),
        model: chalk.cyan(m.model),
        checkpoint: m.checkpoint ? chalk.red('[CHECKPOINT]') : '',
      }));
    });

    const checkpoints = members.filter(m => m.checkpoint).length;
    console.log(`\n${t('dryRunValid', { steps: members.length.toString(), checkpoints: checkpoints.toString() })}\n`);
  }
}

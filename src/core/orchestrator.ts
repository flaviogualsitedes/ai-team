/**
 * Orquestrador do AITeam.
 *
 * Responsável por executar o pipeline de um squad, gerenciar o fluxo de dados
 * entre agentes, aplicar regras/guardrails e persistir logs de execução.
 */

import { generateText, tool } from 'ai';
import { google } from '@ai-sdk/google';
import chalk from 'chalk';
import ora from 'ora';
import { t } from '../i18n/index.js';
import { getDatabase } from '../db/index.js';
import { getModelById } from '../llm/models.js';
import { nanoid } from 'nanoid';

export interface ExecutionOptions {
  projectId: string;
  squadId: string;
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

    let lastOutput = '';
    let totalTokens = 0;
    const startTime = Date.now();

    try {
      for (const agent of members) {
        const stepStartTime = Date.now();
        const modelConfig = getModelById(agent.model);
        
        if (options.onStepStart) {
          options.onStepStart(agent.name, modelConfig?.name || agent.model);
        }

        // TODO: Implementar lógica real de chamada ao LLM com Vercel AI SDK
        // Por enquanto, simulando execução para validar o fluxo do CLI
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const duration = (Date.now() - stepStartTime) / 1000;
        const tokens = Math.floor(Math.random() * 500) + 100; // Simulado
        totalTokens += tokens;

        if (options.onStepComplete) {
          options.onStepComplete({ duration, tokens });
        }

        // Salvar Passo
        this.db.prepare(`
          INSERT INTO execution_steps (id, execution_id, agent_id, step_number, output_full, status, tokens_used, duration_ms)
          VALUES (?, ?, ?, ?, ?, 'completed', ?, ?)
        `).run(nanoid(), executionId, agent.id, agent.position, `Output do agente ${agent.name}`, tokens, duration * 1000);

        lastOutput = `Resultado de ${agent.name}`;
      }

      // Finalizar Execução
      const totalDuration = Date.now() - startTime;
      this.db.prepare(`
        UPDATE executions 
        SET status = 'completed', total_tokens = ?, duration_ms = ?, completed_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(totalTokens, totalDuration, executionId);

      console.log(`\n${t('executionComplete', { 
        duration: (totalDuration / 1000).toFixed(1), 
        tokens: totalTokens.toString(),
        cost: (totalTokens * 0.000002).toFixed(4) 
      })}\n`);

    } catch (error) {
      this.db.prepare('UPDATE executions SET status = "failed" WHERE id = ?').run(executionId);
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

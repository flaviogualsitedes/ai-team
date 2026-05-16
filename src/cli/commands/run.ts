/**
 * Comando: aiteam run <squad>
 *
 * Executa um squad de agentes no projeto atual.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { t } from '../../i18n/index.js';
import { getDatabase } from '../../db/index.js';
import { Orchestrator } from '../../core/orchestrator.js';

/**
 * Registra o comando 'run' no programa principal.
 */
export function registerRunCommand(program: Command): void {
  program
    .command('run')
    .description(t('commands.run'))
    .argument('<squad>', 'Nome do squad a ser executado')
    .option('--dry-run', 'Apenas preview do pipeline')
    .option('--project <id>', 'ID do projeto (opcional, usa o atual por padrão)')
    .action(async (squadName, options) => {
      const db = getDatabase();
      const currentDir = process.cwd();

      // 1. Validar Squad
      const squad = db.prepare('SELECT id FROM squads WHERE name = ?').get(squadName) as any;
      if (!squad) {
        console.log(chalk.red(`\nSquad '${squadName}' não encontrado.\n`));
        return;
      }

      // 2. Validar Projeto
      let projectId = options.project;
      if (!projectId) {
        const project = db.prepare('SELECT id FROM projects WHERE path = ?').get(currentDir) as any;
        if (!project) {
          console.log(chalk.red(`\n${t('projectNotFound')}\n`));
          return;
        }
        projectId = project.id;
      }

      // 3. Executar via Orquestrador
      const orchestrator = new Orchestrator();
      const spinner = ora();

      try {
        await orchestrator.runSquad({
          projectId,
          squadId: squad.id,
          dryRun: options.dryRun,
          onStepStart: (agentName, model) => {
            spinner.start(t('executionStepStarted', { agent: chalk.bold(agentName), model: chalk.dim(model) }));
          },
          onStepComplete: (data) => {
            spinner.succeed(t('executionStepComplete', { 
              duration: data.duration.toFixed(1), 
              tokens: data.tokens.toString() 
            }));
          }
        });
      } catch (error) {
        spinner.fail(t('executionFailed', { error: error instanceof Error ? error.message : String(error) }));
      }
    });
}

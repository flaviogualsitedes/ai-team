/**
 * Comando: aiteam run <squad>
 *
 * Executa um squad de agentes no projeto atual.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import * as prompts from '@inquirer/prompts';
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
    .argument('[squad]', 'Nome do squad a ser executado')
    .option('--task <text>', 'Tarefa ou objetivo inicial para o squad')
    .option('--dry-run', 'Apenas preview do pipeline')
    .option('--project <id>', 'ID do projeto (opcional, usa o atual por padrão)')
    .action(async (squadArg, options) => {
      const db = getDatabase();
      const currentDir = process.cwd();
      let squadName = squadArg;
      let initialTask = options.task;

      // 1. Se não passou nome, oferecer lista
      if (!squadName) {
        const squads = db.prepare('SELECT name FROM squads').all() as { name: string }[];
        
        if (squads.length === 0) {
          console.log(chalk.yellow(`\nNenhum squad encontrado. Crie um com 'aiteam squad create'.\n`));
          return;
        }

        squadName = await prompts.select({
          message: 'Selecione o squad para executar:',
          choices: squads.map(s => ({ name: s.name, value: s.name })),
        });
      }

      // 2. Se não passou tarefa, perguntar
      if (!initialTask && !options.dryRun) {
        initialTask = await prompts.input({
          message: 'Qual é a missão para este squad hoje?',
          validate: (input) => input.length > 5 ? true : 'Descreva a tarefa com pelo menos 5 caracteres.',
        });
      }

      // 2. Validar Squad
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
          initialTask,
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
        const errorMsg = error instanceof Error ? error.message : String(error);
        spinner.fail(chalk.red(`❌ Execução falhou: ${errorMsg}`));
        if (error instanceof Error && error.stack) {
          console.log(chalk.dim(error.stack));
        }
      }
    });
}

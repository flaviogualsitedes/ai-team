/**
 * Comando: aiteam logs
 *
 * Exibe histórico de execuções e detalhes de passos.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { t } from '../../i18n/index.js';
import { getDatabase } from '../../db/index.js';

/**
 * Registra o comando 'logs' no programa principal.
 */
export function registerLogsCommand(program: Command): void {
  const logs = program
    .command('logs')
    .description(t('commands.logs'));

  // 1. logs list
  logs
    .command('list')
    .description('Lista as últimas execuções')
    .option('--limit <n>', 'Limite de resultados', '10')
    .action((options) => {
      const db = getDatabase();
      const executions = db.prepare(`
        SELECT e.*, s.name as squad_name, p.name as project_name
        FROM executions e
        JOIN squads s ON e.squad_id = s.id
        JOIN projects p ON e.project_id = p.id
        ORDER BY e.created_at DESC
        LIMIT ?
      `).all(parseInt(options.limit)) as any[];

      console.log(`\n📜 ${chalk.bold('Histórico de Execuções:')}\n`);

      if (executions.length === 0) {
        console.log(`  ${chalk.dim('Nenhuma execução encontrada.')}`);
      } else {
        executions.forEach(e => {
          const statusColor = e.status === 'completed' ? chalk.green : (e.status === 'failed' ? chalk.red : chalk.yellow);
          console.log(`  ${chalk.dim(e.created_at)} | ${chalk.yellow(e.project_name)} | ${chalk.bold(e.squad_name)} | ${statusColor(e.status.toUpperCase())}`);
        });
      }
      console.log('\n');
    });

  // 2. logs show <id>
  logs
    .command('show')
    .description('Exibe detalhes de uma execução específica')
    .argument('<id>', 'ID da execução (ou parte dele)')
    .action((id) => {
      const db = getDatabase();
      // Tentar buscar por ID exato ou LIKE
      const execution = db.prepare(`
        SELECT e.*, s.name as squad_name 
        FROM executions e 
        JOIN squads s ON e.squad_id = s.id 
        WHERE e.id LIKE ?
      `).get(`${id}%`) as any;

      if (!execution) {
        console.log(chalk.red(`\nExecução '${id}' não encontrada.\n`));
        return;
      }

      const steps = db.prepare(`
        SELECT es.*, a.name as agent_name 
        FROM execution_steps es
        JOIN agents a ON es.agent_id = a.id
        WHERE es.execution_id = ?
        ORDER BY es.step_number ASC
      `).all(execution.id) as any[];

      console.log(`\n📊 ${chalk.bold('Detalhes da Execução:')} ${chalk.cyan(execution.id)}`);
      console.log(`  Squad: ${chalk.yellow(execution.squad_name)}`);
      console.log(`  Data: ${execution.created_at}`);
      console.log(`  Status: ${execution.status}`);
      console.log(`  Tokens: ${execution.total_tokens}`);
      console.log(`  Duração: ${(execution.duration_ms / 1000).toFixed(1)}s\n`);

      console.log(`${chalk.bold('Passos:')}`);
      steps.forEach(s => {
        console.log(`  [${s.step_number}] ${chalk.bold(s.agent_name)} (${s.duration_ms}ms)`);
        console.log(`      ${chalk.dim(s.output_full)}\n`);
      });
    });
}

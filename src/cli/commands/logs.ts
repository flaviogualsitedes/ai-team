/**
 * Comando: aiteam logs
 *
 * Exibe histórico de execuções e detalhes de passos.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import * as prompts from '@inquirer/prompts';
import { t } from '../../i18n/index.js';
import { getDatabase } from '../../db/index.js';

/**
 * Registra o comando 'logs' no programa principal.
 */
export function registerLogsCommand(program: Command): void {
  const logs = program
    .command('logs')
    .description(t('commands.logs'))
    .action(async () => {
      // Se rodar apenas 'logs', vira interativo
      const db = getDatabase();
      const executions = db.prepare(`
        SELECT e.*, s.name as squad_name
        FROM executions e
        JOIN squads s ON e.squad_id = s.id
        ORDER BY e.created_at DESC
        LIMIT 10
      `).all() as any[];

      if (executions.length === 0) {
        console.log(chalk.yellow(`\nNenhuma execução encontrada. Execute um squad primeiro.\n`));
        return;
      }

      const choices = executions.map(e => ({
        name: `${chalk.dim(e.created_at)} | ${chalk.bold(e.squad_name.padEnd(20))} | ${e.status.toUpperCase()}`,
        value: e.id
      }));

      const selectedId = await prompts.select({
        message: 'Selecione a execução para ver os detalhes:',
        choices
      });

      showExecutionDetails(selectedId);
    });

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
      showExecutionDetails(id);
    });
}

/**
 * Função auxiliar para exibir detalhes de uma execução.
 */
function showExecutionDetails(id: string): void {
  const db = getDatabase();
  const execution = db.prepare(`
    SELECT e.*, s.name as squad_name, p.token_budget, p.cost_budget_usd
    FROM executions e 
    JOIN squads s ON e.squad_id = s.id 
    JOIN projects p ON e.project_id = p.id
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

  const remainingTokens = execution.token_budget - execution.total_tokens;

  console.log(`\n${chalk.bgCyan.black(' 📊 DETALHES DA EXECUÇÃO ')} ${chalk.cyan(execution.id)}`);
  console.log(`  ${chalk.bold('Squad:')}        ${chalk.yellow(execution.squad_name)}`);
  console.log(`  ${chalk.bold('Data:')}         ${execution.created_at}`);
  console.log(`  ${chalk.bold('Status:')}       ${execution.status === 'completed' ? chalk.green('COMPLETO') : chalk.red('FALHOU')}`);
  console.log(`  ${chalk.bold('Tokens:')}       ${chalk.white(execution.total_tokens)} Usados / ${chalk.dim(remainingTokens + ' Restantes')}`);
  console.log(`  ${chalk.bold('Duração:')}      ${(execution.duration_ms / 1000).toFixed(1)}s`);
  console.log(`  ${chalk.bold('Custo Total:')}  ${chalk.green('$' + execution.total_cost_usd.toFixed(4))}\n`);

  console.log(`${chalk.bold('Agentes usados:')}`);
  steps.forEach(s => {
    console.log(`  • Agente ${chalk.bold(s.agent_name.padEnd(15))} - Tokens: ${s.tokens_used.toString().padEnd(5)} - Custo: ${chalk.green('$' + s.cost_usd.toFixed(4))} - Modelo: ${chalk.dim(s.model_id)}`);
  });

  console.log(`\n${chalk.bold.underline('CONTEÚDO GERADO:')}\n`);
  
  steps.forEach(s => {
    console.log(`${chalk.bgWhite.black(` Passo ${s.step_number}: ${s.agent_name} `)}`);
    console.log(`\n${s.output_full}\n`);
    console.log(chalk.dim('---'.repeat(20)));
  });
  
  console.log('\n');
}

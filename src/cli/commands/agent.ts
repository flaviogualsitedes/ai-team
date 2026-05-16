/**
 * Comando: aiteam agent
 *
 * Gerencia agentes globais.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import * as prompts from '@inquirer/prompts';
import { t } from '../../i18n/index.js';
import { getDatabase } from '../../db/index.js';
import { MODELS } from '../../llm/models.js';
import { nanoid } from 'nanoid';

/**
 * Registra o comando 'agent' no programa principal.
 */
export function registerAgentCommand(program: Command): void {
  const agent = program
    .command('agent')
    .description(t('commands.agent'));

  // 1. agent create
  agent
    .command('create')
    .description(t('commands.agentCreate'))
    .action(async () => {
      const data = {
        name: await prompts.input({ message: t('askAgentName') }),
        role: await prompts.input({ message: t('askAgentRole') }),
        model: await prompts.select({
          message: t('askAgentModel'),
          choices: MODELS.map(m => ({ name: `${m.costEmoji} ${m.name}`, value: m.id })),
        }),
      };

      const db = getDatabase();
      const id = nanoid();
      
      try {
        db.prepare(`
          INSERT INTO agents (id, name, role, model)
          VALUES (?, ?, ?, ?)
        `).run(id, data.name, data.role, data.model);

        console.log(`\n${t('agentCreated', { name: chalk.bold(data.name) })}\n`);
      } catch (error) {
        console.log(chalk.red(`\nErro: ${error instanceof Error && error.message.includes('UNIQUE') ? 'Nome de agente já existe.' : error}\n`));
      }
    });

  // 2. agent list
  agent
    .command('list')
    .description(t('commands.agentList'))
    .action(() => {
      const db = getDatabase();
      const agents = db.prepare('SELECT * FROM agents').all() as any[];

      console.log(`\n👥 ${chalk.bold('Agentes Disponíveis:')}\n`);

      if (agents.length === 0) {
        console.log(`  ${chalk.dim(t('noAgentsFound'))}`);
      } else {
        agents.forEach(a => {
          console.log(`  • ${chalk.yellow(a.name.padEnd(20))} | ${chalk.cyan(a.model.padEnd(15))} | ${chalk.dim(a.role)}`);
        });
      }
      console.log('\n');
    });

  // 3. agent delete <name>
  agent
    .command('delete')
    .description(t('commands.agentDelete'))
    .argument('<name>', 'Nome do agente')
    .action(async (name) => {
      const confirm = await prompts.confirm({
        message: `Tem certeza que deseja remover o agente '${name}'?`,
        default: false,
      });

      if (confirm) {
        const db = getDatabase();
        const result = db.prepare('DELETE FROM agents WHERE name = ?').run(name);
        
        if (result.changes > 0) {
          console.log(`\n${t('agentDeleted', { name: chalk.bold(name) })}\n`);
        } else {
          console.log(chalk.red(`\nAgente '${name}' não encontrado.\n`));
        }
      }
    });
}

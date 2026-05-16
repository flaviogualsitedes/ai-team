/**
 * Comando: aiteam squad
 *
 * Gerencia squads globais e sua alocação em projetos.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import * as prompts from '@inquirer/prompts';
import { t } from '../../i18n/index.js';
import { getDatabase } from '../../db/index.js';
import { nanoid } from 'nanoid';

/**
 * Registra o comando 'squad' no programa principal.
 */
export function registerSquadCommand(program: Command): void {
  const squad = program
    .command('squad')
    .description(t('commands.squad'));

  // 1. squad create
  squad
    .command('create')
    .description(t('commands.squadCreate'))
    .action(async () => {
      const db = getDatabase();
      const agents = db.prepare('SELECT id, name FROM agents').all() as any[];

      if (agents.length === 0) {
        console.log(chalk.yellow(`\n${t('noAgentsFound')} Crie agentes primeiro com 'aiteam agent create'.\n`));
        return;
      }

      const name = await prompts.input({ message: t('askSquadName') });
      const description = await prompts.input({ message: t('askSquadDescription') });
      
      const selectedAgents = await prompts.checkbox({
        message: t('askSquadMembers'),
        choices: agents.map(a => ({ name: a.name, value: a.id })),
        validate: (input) => input.length > 0 ? true : 'Selecione ao menos um agente.',
      });

      const squadId = nanoid();
      
      try {
        // Inserir squad (pipeline guardado como JSON da ordem dos IDs)
        db.prepare(`
          INSERT INTO squads (id, name, description, pipeline)
          VALUES (?, ?, ?, ?)
        `).run(squadId, name, description, JSON.stringify(selectedAgents));

        // Inserir membros com posição
        const insertMember = db.prepare(`
          INSERT INTO squad_members (squad_id, agent_id, position)
          VALUES (?, ?, ?)
        `);

        selectedAgents.forEach((agentId, index) => {
          insertMember.run(squadId, agentId, index + 1);
        });

        console.log(`\n${t('squadCreated', { name: chalk.bold(name) })}\n`);
      } catch (error) {
        console.log(chalk.red(`\nErro: ${error instanceof Error && error.message.includes('UNIQUE') ? 'Nome de squad já existe.' : error}\n`));
      }
    });

  // 2. squad list
  squad
    .command('list')
    .description(t('commands.squadList'))
    .action(() => {
      const db = getDatabase();
      const squads = db.prepare('SELECT * FROM squads').all() as any[];

      console.log(`\n🏹 ${chalk.bold('Squads Disponíveis:')}\n`);

      if (squads.length === 0) {
        console.log(`  ${chalk.dim(t('noSquadsFound'))}`);
      } else {
        squads.forEach(s => {
          const membersCount = JSON.parse(s.pipeline).length;
          console.log(`  • ${chalk.yellow(s.name.padEnd(20))} | ${chalk.cyan(membersCount + ' membros')} | ${chalk.dim(s.description)}`);
        });
      }
      console.log('\n');
    });

  // 3. squad delete <name>
  squad
    .command('delete')
    .description(t('commands.squadDelete'))
    .argument('<name>', 'Nome do squad')
    .action(async (name) => {
      const confirm = await prompts.confirm({
        message: `Tem certeza que deseja remover o squad '${name}'?`,
        default: false,
      });

      if (confirm) {
        const db = getDatabase();
        const result = db.prepare('DELETE FROM squads WHERE name = ?').run(name);
        
        if (result.changes > 0) {
          console.log(`\n${t('squadDeleted', { name: chalk.bold(name) })}\n`);
        } else {
          console.log(chalk.red(`\nSquad '${name}' não encontrado.\n`));
        }
      }
    });
}

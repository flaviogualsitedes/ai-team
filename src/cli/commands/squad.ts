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

    const name = await prompts.input({ message: t('askSquadName') });
    const description = await prompts.input({ message: t('askSquadDescription') });
    
    // Preparar lista com opção de criar novo
    const choices = [
      ...agents.map(a => ({ name: a.name, value: a.id })),
      { name: chalk.green(' [+ Criar Novo Agente]'), value: 'create_new' }
    ];

    let selectedAgents = await prompts.checkbox({
      message: `${t('askSquadMembers')} (Use ESPAÇO para selecionar)`,
      choices,
      validate: (input) => input.length > 0 ? true : 'Selecione ao menos um agente ou crie um novo.',
    });

    // Se escolheu criar novo agente, vamos pro loop de criação
    if (selectedAgents.includes('create_new')) {
      // Remover o flag 'create_new'
      selectedAgents = selectedAgents.filter(id => id !== 'create_new');

      console.log(chalk.cyan('\n--- Criando Novo Agente ---'));
      const newAgent = {
        name: await prompts.input({ message: t('askAgentName') }),
        role: await prompts.input({ message: t('askAgentRole') }),
        model: await prompts.select({
          message: t('askAgentModel'),
          choices: (await import('../../llm/models.js')).MODELS.map(m => ({ name: `${m.costEmoji} ${m.name}`, value: m.id })),
        }),
      };

      const agentId = (await import('nanoid')).nanoid();
      db.prepare(`
        INSERT INTO agents (id, name, role, model)
        VALUES (?, ?, ?, ?)
      `).run(agentId, newAgent.name, newAgent.role, newAgent.model);
      
      selectedAgents.push(agentId);
      console.log(chalk.green(`Agente '${newAgent.name}' criado e adicionado ao squad!\n`));
    }

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

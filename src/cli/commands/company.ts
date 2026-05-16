/**
 * Comando: aiteam company
 *
 * Gerencia o contexto da empresa para os agentes.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import * as prompts from '@inquirer/prompts';
import { t } from '../../i18n/index.js';
import { getDatabase } from '../../db/index.js';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Registra o comando 'company' no programa principal.
 */
export function registerCompanyCommand(program: Command): void {
  const company = program
    .command('company')
    .description(t('commands.company'));

  // 1. company setup
  company
    .command('setup')
    .description(t('commands.companySetup'))
    .action(async () => {
      const currentDir = process.cwd();
      const db = getDatabase();
      
      const project = db.prepare('SELECT id, company_context_path FROM projects WHERE path = ?').get(currentDir) as any;
      
      if (!project) {
        console.log(chalk.red(`\n${t('projectNotFound')}\n`));
        return;
      }

      const data = {
        name: await prompts.input({ message: t('askCompanyName') }),
        sector: await prompts.input({ message: t('askCompanySector') }),
        description: await prompts.input({ message: t('askCompanyDescription') }),
        tone: await prompts.select({
          message: t('askCompanyTone'),
          choices: Object.entries(t('toneOptions')).map(([value, name]) => ({
            name: name as string,
            value,
          })),
        }),
        audience: await prompts.input({ message: t('askCompanyAudience') }),
      };

      const aiteamDir = path.join(currentDir, '.aiteam');
      if (!fs.existsSync(aiteamDir)) fs.mkdirSync(aiteamDir);

      const companyPath = path.join(aiteamDir, 'company.md');
      const content = `# Contexto da Empresa: ${data.name}\n\n` +
                      `**Setor:** ${data.sector}\n` +
                      `**Descrição:** ${data.description}\n` +
                      `**Tom de Voz:** ${data.tone}\n` +
                      `**Público-alvo:** ${data.audience}\n`;
      
      fs.writeFileSync(companyPath, content);
      
      db.prepare('UPDATE projects SET company_context_path = ? WHERE id = ?')
        .run(companyPath, project.id);

      console.log(`\n${chalk.green(t('companySaved'))}\n`);
    });

  // 2. company show
  company
    .command('show')
    .description(t('commands.companyShow'))
    .action(() => {
      const currentDir = process.cwd();
      const db = getDatabase();
      const project = db.prepare('SELECT company_context_path FROM projects WHERE path = ?').get(currentDir) as any;

      if (!project || !project.company_context_path || !fs.existsSync(project.company_context_path)) {
        console.log(chalk.yellow('\nNenhum contexto de empresa configurado.\n'));
        return;
      }

      const content = fs.readFileSync(project.company_context_path, 'utf-8');
      console.log(`\n${chalk.bold('Contexto Atual:')}\n`);
      console.log(chalk.dim(content));
    });
}

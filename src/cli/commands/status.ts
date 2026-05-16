/**
 * Comando: aiteam status
 *
 * Exibe o estado atual do projeto, banco de dados e ambiente.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { t } from '../../i18n/index.js';
import { getDatabase, getDatabasePath } from '../../db/index.js';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Registra o comando 'status' no programa principal.
 */
export function registerStatusCommand(program: Command): void {
  program
    .command('status')
    .description(t('commands.status'))
    .action(async () => {
      console.log(`\n🚀 ${chalk.bold('AITeam Status')}\n`);

      // 1. Verificar Banco de Dados
      const dbPath = getDatabasePath();
      const dbExists = fs.existsSync(dbPath);
      console.log(`${chalk.bold('Banco de Dados:')}`);
      console.log(`  Path: ${chalk.cyan(dbPath)}`);
      console.log(`  Status: ${dbExists ? chalk.green('Conectado ✅') : chalk.red('Não inicializado ❌')}`);

      if (dbExists) {
        try {
          const db = getDatabase();
          const projectsCount = db.prepare('SELECT COUNT(*) as count FROM projects').get() as { count: number };
          const agentsCount = db.prepare('SELECT COUNT(*) as count FROM agents').get() as { count: number };
          const squadsCount = db.prepare('SELECT COUNT(*) as count FROM squads').get() as { count: number };

          console.log(`  Projetos: ${chalk.yellow(projectsCount.count)}`);
          console.log(`  Agentes: ${chalk.yellow(agentsCount.count)}`);
          console.log(`  Squads: ${chalk.yellow(squadsCount.count)}`);
        } catch (error) {
          console.log(`  Erro ao ler banco: ${chalk.red(error instanceof Error ? error.message : String(error))}`);
        }
      }

      // 2. Verificar Projeto Atual
      const currentDir = process.cwd();
      const isProject = fs.existsSync(path.join(currentDir, 'package.json')) && 
                        (fs.existsSync(path.join(currentDir, '.aiteam')) || fs.existsSync(path.join(currentDir, 'src')));

      console.log(`\n${chalk.bold('Diretório Atual:')}`);
      console.log(`  Path: ${chalk.cyan(currentDir)}`);
      console.log(`  Projeto AITeam: ${isProject ? chalk.green('Sim ✅') : chalk.yellow('Não (Execute "aiteam init") ⚠️')}`);

      // 3. Verificar API Keys (Globais)
      console.log(`\n${chalk.bold('API Keys (Globais):')}`);
      try {
        const db = getDatabase();
        const keys = db.prepare('SELECT provider FROM api_keys').all() as { provider: string }[];
        
        if (keys.length === 0) {
          console.log(`  ${chalk.dim('Nenhuma key configurada. Use "aiteam config set-key".')}`);
        } else {
          keys.forEach(k => {
            console.log(`  ${k.provider}: ${chalk.green('Configurada ✅')}`);
          });
        }
      } catch (error) {
        // Silencioso se banco não existir
      }

      console.log('\n');
    });
}

import { Command } from 'commander';
import chalk from 'chalk';
import { getDatabase } from '../../db/index.js';
import { Vault } from '../../core/vault.js';

export function registerDebugCommand(program: Command): void {
  const debug = program.command('debug').description('Comandos de depuração interna');

  debug
    .command('list-models')
    .description('Lista os modelos que a sua API Key realmente permite')
    .action(async () => {
      const db = getDatabase();
      const keyRecord = db.prepare('SELECT api_key FROM api_keys WHERE provider = ?').get('google') as any;

      if (!keyRecord) {
        console.log(chalk.red('❌ Nenhuma chave do Google encontrada no Vault.'));
        return;
      }

      const apiKey = Vault.decrypt(keyRecord.api_key);
      console.log(chalk.blue('📡 Consultando Google API com sua chave...'));

      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.error) {
          console.error(chalk.red('❌ Erro da API:'), data.error.message);
          return;
        }

        console.log(`\n${chalk.green.bold('✅ Modelos disponíveis para você:')}`);
        data.models.forEach((m: any) => {
          if (m.supportedGenerationMethods.includes('generateContent')) {
            const id = m.name.replace('models/', '');
            console.log(`${chalk.yellow('•')} ${chalk.bold(id)} ${chalk.dim(`(${m.displayName})`)}`);
          }
        });
      } catch (error) {
        console.error(chalk.red('❌ Erro ao conectar:'), (error as Error).message);
      }
    });
}

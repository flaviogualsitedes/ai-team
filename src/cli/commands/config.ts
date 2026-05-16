/**
 * Comando: aiteam config
 *
 * Gerencia configurações globais e do projeto, incluindo chaves de API.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import * as prompts from '@inquirer/prompts';
import { t } from '../../i18n/index.js';
import { getDatabase } from '../../db/index.js';
import { Vault } from '../../core/vault.js';

/**
 * Registra o comando 'config' no programa principal.
 */
export function registerConfigCommand(program: Command): void {
  const config = program
    .command('config')
    .description(t('commands.config'));

  // 1. config show
  config
    .command('show')
    .description(t('commands.configShow'))
    .action(() => {
      const db = getDatabase();
      const configs = db.prepare('SELECT * FROM truth_config').all() as any[];
      
      console.log(`\n⚙️  ${chalk.bold('Configurações Atuais:')}\n`);
      
      if (configs.length === 0) {
        console.log(`  ${chalk.dim('Nenhuma configuração personalizada.')}`);
      } else {
        configs.forEach(c => {
          console.log(`  ${chalk.yellow(c.key)}: ${c.value} ${chalk.dim(`(${c.scope_type})`)}`);
        });
      }
      console.log('\n');
    });

  // 2. config set-key <provider>
  config
    .command('set-key')
    .description(t('commands.configSetKey'))
    .argument('[provider]', 'Provedor (google, anthropic, openai, etc.)')
    .action(async (providerArg) => {
      let provider = providerArg;
      
      if (!provider) {
        provider = await prompts.select({
          message: 'Escolha o provedor:',
          choices: [
            { name: 'Google (Gemini)', value: 'google' },
            { name: 'Anthropic (Claude)', value: 'anthropic' },
            { name: 'OpenAI (GPT)', value: 'openai' },
          ],
        });
      }

      const key = await prompts.password({
        message: `Digite sua API key para ${provider}:`,
        mask: '*',
      });

      const encryptedKey = Vault.encrypt(key);

      const db = getDatabase();
      db.prepare(`
        INSERT INTO api_keys (provider, api_key)
        VALUES (?, ?)
        ON CONFLICT(provider) DO UPDATE SET api_key = excluded.api_key, updated_at = CURRENT_TIMESTAMP
      `).run(provider, encryptedKey);

      console.log(`\n${t('keySet', { provider: chalk.bold(provider) })}\n`);
    });

  // 3. config keys
  config
    .command('keys')
    .description(t('commands.configKeys'))
    .action(() => {
      const db = getDatabase();
      const keys = db.prepare('SELECT provider, api_key FROM api_keys').all() as any[];
      
      console.log(`\n🔑 ${chalk.bold('API Keys Configuradas:')}\n`);
      
      if (keys.length === 0) {
        console.log(`  ${chalk.dim(t('noKeysFound', { default: 'Nenhuma chave encontrada.' }))}`);
      } else {
        keys.forEach(k => {
          try {
            const decrypted = Vault.decrypt(k.api_key);
            const masked = decrypted.substring(0, 4) + '...' + decrypted.substring(decrypted.length - 4);
            console.log(`  ${chalk.yellow(k.provider.padEnd(10))}: ${chalk.green(masked)}`);
          } catch (e) {
            console.log(`  ${chalk.yellow(k.provider.padEnd(10))}: ${chalk.red('ERRO DE DESCRIPTOGRAFIA')}`);
          }
        });
      }
      console.log('\n');
    });

  // 4. config reset
  config
    .command('reset')
    .description(t('commands.configReset'))
    .action(async () => {
      const confirm = await prompts.confirm({
        message: chalk.red('Isso irá apagar TODAS as configurações e chaves de API. Tem certeza?'),
        default: false,
      });

      if (confirm) {
        const db = getDatabase();
        db.prepare('DELETE FROM api_keys').run();
        db.prepare('DELETE FROM truth_config').run();
        console.log(`\n${t('configReset')}\n`);
      }
    });

  // 5. config list-models <provider>
  config
    .command('list-models')
    .argument('<provider>', 'google | openai | anthropic')
    .description('Lista os modelos disponíveis no provedor usando sua API Key')
    .action(async (provider) => {
      if (provider !== 'google') {
        console.log(chalk.yellow(`\nAinda não implementado para ${provider}. Tente 'google'.\n`));
        return;
      }

      const db = getDatabase();
      const keyRecord = db.prepare('SELECT api_key FROM api_keys WHERE provider = ?').get('google') as any;

      if (!keyRecord) {
        console.log(chalk.red('\nErro: API Key do Google não encontrada. Configure com "aiteam config set-key google".\n'));
        return;
      }

      const apiKey = Vault.decrypt(keyRecord.api_key);
      const { default: ora } = await import('ora');
      const spinner = ora('Buscando modelos no Google...').start();

      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json() as any;

        spinner.stop();

        if (data.error) {
          console.log(chalk.red(`\n❌ Erro da API: ${data.error.message}\n`));
          return;
        }

        console.log(`\n${chalk.bold.green('✅ Modelos disponíveis para sua chave Google:')}\n`);
        
        data.models
          .filter((m: any) => m.supportedGenerationMethods.includes('generateContent'))
          .forEach((m: any) => {
            console.log(`${chalk.cyan('•')} ${chalk.bold(m.name.replace('models/', ''))} ${chalk.dim(`(${m.displayName})`)}`);
          });
        console.log('');

      } catch (error: any) {
        spinner.stop();
        console.log(chalk.red(`\n❌ Erro ao conectar: ${error.message}\n`));
      }
    });
}

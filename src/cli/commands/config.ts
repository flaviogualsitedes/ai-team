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
}

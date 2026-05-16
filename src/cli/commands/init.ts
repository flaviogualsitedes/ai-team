/**
 * Comando: aiteam init
 *
 * Wizard interativo para inicializar um novo projeto AITeam.
 * Configura idioma, IDEs, modelo padrão, contexto da empresa e agente inicial.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import * as prompts from '@inquirer/prompts';
import ora from 'ora';
import fs from 'node:fs';
import path from 'node:path';
import { t, loadLocale, AVAILABLE_LOCALES, SupportedLocale } from '../../i18n/index.js';
import { getDatabase } from '../../db/index.js';
import { MODELS, getDefaultModel } from '../../llm/models.ts';
import { nanoid } from 'nanoid';

/**
 * Registra o comando 'init' no programa principal.
 */
export function registerInitCommand(program: Command): void {
  program
    .command('init')
    .description(t('commands.init'))
    .action(async () => {
      console.log(`\n${chalk.bold.green('🤖 AITeam — Setup Wizard')}\n`);

      const currentDir = process.cwd();
      const db = getDatabase();

      // 1. Escolha do Idioma (afeta o restante do wizard)
      const language = await prompts.select({
        message: 'Escolha o idioma do projeto / Choose project language:',
        choices: Object.entries(AVAILABLE_LOCALES).map(([value, name]) => ({
          name,
          value: value as SupportedLocale,
        })),
      });

      loadLocale(language);

      // 2. Dados Básicos do Usuário e Projeto
      const userName = await prompts.input({
        message: t('askName'),
        default: 'Dev',
      });

      const projectName = await prompts.input({
        message: t('askProjectName'),
        default: path.basename(currentDir),
      });

      // 3. Escolha das IDEs
      const ides = await prompts.checkbox({
        message: t('askIdes'),
        choices: [
          { name: 'Antigravity', value: 'antigravity' },
          { name: 'Claude Code', value: 'claude-code' },
          { name: 'Cursor', value: 'cursor' },
          { name: 'VS Code (Copilot/Windsurf)', value: 'vscode' },
          { name: 'Trae', value: 'trae' },
          { name: 'Windsurf', value: 'windsurf' },
          { name: 'Qwen Code', value: 'qwen' },
        ],
      });

      // 4. Modelo de IA Padrão
      const defaultModelId = await prompts.select({
        message: t('askModel'),
        choices: MODELS.map((m) => ({
          name: `${m.costEmoji} ${m.name} — ${m.description}`,
          value: m.id,
        })),
        default: getDefaultModel().id,
      });

      // 5. Contexto da Empresa (Opcional)
      const hasCompany = await prompts.confirm({
        message: 'Deseja configurar o contexto da empresa agora?',
        default: true,
      });

      let companyData = null;
      if (hasCompany) {
        companyData = {
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
      }

      // 6. Criar Agente Inicial?
      const createAgent = await prompts.confirm({
        message: 'Deseja criar seu primeiro agente agora?',
        default: true,
      });

      let agentData = null;
      if (createAgent) {
        agentData = {
          name: await prompts.input({ message: t('askAgentName'), default: 'Pesquisador' }),
          role: await prompts.input({ message: t('askAgentRole'), default: 'Especialista em pesquisa e análise de dados' }),
          model: await prompts.select({
            message: t('askAgentModel'),
            choices: MODELS.map((m) => ({
              name: `${m.costEmoji} ${m.name}`,
              value: m.id,
            })),
            default: defaultModelId,
          }),
        };
      }

      // === EXECUÇÃO DO SETUP ===
      const spinner = ora('Inicializando projeto...').start();

      try {
        // A. Salvar no Banco
        const projectId = nanoid();
        db.prepare(`
          INSERT INTO projects (id, name, path, language, user_name, default_model, ides)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(projectId, projectName, currentDir, language, userName, defaultModelId, ides.join(','));

        if (agentData) {
          const agentId = nanoid();
          db.prepare(`
            INSERT INTO agents (id, name, role, model)
            VALUES (?, ?, ?, ?)
          `).run(agentId, agentData.name, agentData.role, agentData.model);

          // Associar agente ao projeto
          db.prepare(`
            INSERT INTO project_agents (project_id, agent_id)
            VALUES (?, ?)
          `).run(projectId, agentId);
        }

        // B. Criar Estrutura de Pastas Local
        const aiteamDir = path.join(currentDir, '.aiteam');
        if (!fs.existsSync(aiteamDir)) fs.mkdirSync(aiteamDir);

        // C. Salvar Company Context se houver
        if (companyData) {
          const companyPath = path.join(aiteamDir, 'company.md');
          const content = `# Contexto da Empresa: ${companyData.name}\n\n` +
                          `**Setor:** ${companyData.sector}\n` +
                          `**Descrição:** ${companyData.description}\n` +
                          `**Tom de Voz:** ${companyData.tone}\n` +
                          `**Público-alvo:** ${companyData.audience}\n`;
          fs.writeFileSync(companyPath, content);
          
          db.prepare('UPDATE projects SET company_context_path = ? WHERE id = ?')
            .run(companyPath, projectId);
        }

        // D. TODO: Injetar Templates de IDE (Fase 2)

        spinner.succeed(chalk.green(t('projectInitialized')));
        
        console.log(`\n${chalk.bold(t('nextSteps'))}`);
        console.log(`  1. Configure suas chaves: ${chalk.cyan('aiteam config set-key google')}`);
        console.log(`  2. Crie um squad: ${chalk.cyan('aiteam squad create')}`);
        console.log(`  3. Execute seu primeiro squad: ${chalk.cyan('aiteam run <squad>')}`);
        
      } catch (error) {
        spinner.fail(chalk.red('Erro ao inicializar projeto'));
        console.error(error);
      }

      console.log('\n');
    });
}

/**
 * AITeam — Entry Point do CLI
 *
 * Este é o ponto de entrada principal da ferramenta de linha de comando.
 * Registra todos os comandos disponíveis e inicializa o programa.
 */

import { Command } from 'commander';
import { loadLocale } from './i18n/index.js';
import { closeDatabase } from './db/index.js';
import { registerInitCommand } from './cli/commands/init.js';
import { registerStatusCommand } from './cli/commands/status.js';
import { registerConfigCommand } from './cli/commands/config.js';
import { registerCompanyCommand } from './cli/commands/company.js';
import { registerAgentCommand } from './cli/commands/agent.js';
import { registerSquadCommand } from './cli/commands/squad.js';
import { registerRunCommand } from './cli/commands/run.js';
import { registerLogsCommand } from './cli/commands/logs.js';

/** Versão do AITeam — sincronizada com package.json */
const VERSION = '0.1.0';

/**
 * Cria e configura o programa CLI principal.
 */
function createProgram(): Command {
  const program = new Command();

  program
    .name('aiteam')
    .description('🤖 AITeam — Framework de orquestração multi-agente')
    .version(VERSION, '-v, --version', 'Exibir versão do AITeam');

  // Registrar comandos
  registerInitCommand(program);
  registerStatusCommand(program);
  registerConfigCommand(program);
  registerCompanyCommand(program);
  registerAgentCommand(program);
  registerSquadCommand(program);
  registerRunCommand(program);
  registerLogsCommand(program);

  // TODO: Registrar demais comandos conforme implementados
  // registerConfigCommand(program);
  // registerCompanyCommand(program);
  // registerAgentCommand(program);
  // registerSquadCommand(program);
  // registerRunCommand(program);
  // registerRuleCommand(program);
  // registerVaultCommand(program);
  // registerKnowledgeCommand(program);
  // registerMemoryCommand(program);
  // registerLogsCommand(program);
  // registerErrorsCommand(program);
  // registerPanelCommand(program);
  // registerUpdateCommand(program);

  return program;
}

/**
 * Ponto de entrada principal.
 */
async function main(): Promise<void> {
  try {
    // Carregar idioma padrão (será alterado pelo init se necessário)
    loadLocale('pt-BR');

    const program = createProgram();
    await program.parseAsync(process.argv);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`❌ ${error.message}`);
    } else {
      console.error('❌ Erro inesperado:', error);
    }
    process.exitCode = 1;
  } finally {
    closeDatabase();
  }
}

main();

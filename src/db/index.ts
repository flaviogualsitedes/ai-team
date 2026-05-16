/**
 * Módulo de conexão ao banco de dados SQLite do AITeam.
 *
 * O banco é armazenado globalmente em ~/.aiteam/aiteam.db
 * Suporta criação automática do diretório e migrações.
 */

import Database from 'better-sqlite3';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
import { runMigrations } from './schema.js';

/** Diretório global do AITeam */
const GLOBAL_DIR = path.join(os.homedir(), '.aiteam');

/** Caminho do banco de dados */
const DB_PATH = path.join(GLOBAL_DIR, 'aiteam.db');

/** Instância singleton do banco */
let dbInstance: Database.Database | null = null;

/**
 * Garante que o diretório global ~/.aiteam/ existe.
 */
function ensureGlobalDir(): void {
  if (!fs.existsSync(GLOBAL_DIR)) {
    fs.mkdirSync(GLOBAL_DIR, { recursive: true });
  }
}

/**
 * Retorna a instância do banco de dados SQLite.
 * Cria o banco e executa migrações automaticamente na primeira chamada.
 *
 * @returns Instância do better-sqlite3
 */
export function getDatabase(): Database.Database {
  if (dbInstance) return dbInstance;

  ensureGlobalDir();

  dbInstance = new Database(DB_PATH);

  // Performance: WAL mode para leituras concorrentes
  dbInstance.pragma('journal_mode = WAL');
  dbInstance.pragma('foreign_keys = ON');

  // Executar migrações
  runMigrations(dbInstance);

  return dbInstance;
}

/**
 * Fecha a conexão com o banco de dados.
 * Deve ser chamado ao encerrar o processo.
 */
export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

/**
 * Retorna o caminho do diretório global do AITeam.
 */
export function getGlobalDir(): string {
  ensureGlobalDir();
  return GLOBAL_DIR;
}

/**
 * Retorna o caminho do banco de dados.
 */
export function getDatabasePath(): string {
  return DB_PATH;
}

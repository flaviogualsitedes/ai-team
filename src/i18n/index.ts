/**
 * Sistema de Internacionalização (i18n) do AITeam.
 *
 * Suporta PT-BR, EN e ES. O idioma é carregado dinamicamente
 * com base na configuração do projeto ou preferência do usuário.
 *
 * @example
 * ```ts
 * import { loadLocale, t } from './i18n/index.js';
 *
 * loadLocale('pt-BR');
 * console.log(t('welcome')); // "🟢 Bem-vindo ao AITeam!"
 * console.log(t('agentCreated', { name: 'Pesquisador' }));
 * // "✅ Agente 'Pesquisador' criado com sucesso!"
 * ```
 */

import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

/** Códigos de idioma suportados */
export type SupportedLocale = 'pt-BR' | 'en' | 'es';

/** Estrutura de um arquivo de locale (chave → string) */
type LocaleData = Record<string, string | Record<string, string>>;

/** Idiomas disponíveis com nomes legíveis */
export const AVAILABLE_LOCALES: Record<SupportedLocale, string> = {
  'pt-BR': 'Português (Brasil)',
  'en': 'English',
  'es': 'Español',
};

/** Estado interno do módulo */
let currentLocale: SupportedLocale = 'en';
let currentData: LocaleData = {};
let fallbackData: LocaleData = {};

/**
 * Resolve o caminho da pasta de locales.
 * Funciona tanto em desenvolvimento (src/) quanto em produção (dist/).
 */
function getLocalesDir(): string {
  const thisFile = fileURLToPath(import.meta.url);
  const thisDir = path.dirname(thisFile);

  // 1. Tentar em dist (locales fica na raiz do dist)
  const distPath = path.join(thisDir, 'locales');
  if (fs.existsSync(distPath)) return distPath;

  // 2. Tentar em dev (src/i18n -> ../templates/locales)
  const devPath = path.join(thisDir, '..', 'templates', 'locales');
  if (fs.existsSync(devPath)) return devPath;

  return distPath;
}

/**
 * Carrega um arquivo de locale do disco.
 */
function loadLocaleFile(code: SupportedLocale): LocaleData {
  const localesDir = getLocalesDir();
  const filePath = path.join(localesDir, `${code}.json`);

  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️ Locale '${code}' não encontrado em: ${filePath}`);
    return {};
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content) as LocaleData;
}

/**
 * Carrega o idioma especificado e o fallback (EN).
 *
 * @param code - Código do idioma (ex: 'pt-BR', 'en', 'es')
 */
export function loadLocale(code: SupportedLocale): void {
  currentLocale = code;
  currentData = loadLocaleFile(code);

  // Fallback sempre é inglês
  if (code !== 'en') {
    fallbackData = loadLocaleFile('en');
  } else {
    fallbackData = currentData;
  }
}

/**
 * Traduz uma chave, substituindo variáveis no formato `{variavel}`.
 *
 * Suporta chaves aninhadas com ponto: `t('commands.init')`
 *
 * @param key - Chave de tradução (ex: 'welcome', 'agentCreated')
 * @param vars - Variáveis para substituição (ex: { name: 'Pesquisador' })
 * @returns String traduzida ou a chave se não encontrada
 */
export function t(key: string, vars: Record<string, string> = {}): any {
  const value = resolveKey(currentData, key) ?? resolveKey(fallbackData, key) ?? key;

  if (typeof value === 'object') return value;

  let result = String(value);

  // Substituir variáveis {nome} → valor
  for (const [varKey, varValue] of Object.entries(vars)) {
    result = result.replaceAll(`{${varKey}}`, varValue);
  }

  return result;
}

/**
 * Resolve uma chave potencialmente aninhada (ex: 'commands.init').
 */
function resolveKey(data: LocaleData, key: string): any {
  const parts = key.split('.');

  if (parts.length === 1) {
    return data[key];
  }

  // Chave aninhada: 'commands.init' → data['commands']['init']
  const [group, subKey] = parts;
  const groupData = data[group];

  if (typeof groupData === 'object' && groupData !== null && subKey in groupData) {
    return (groupData as any)[subKey];
  }

  return undefined;
}

/**
 * Retorna o código do idioma atual.
 */
export function getLocale(): SupportedLocale {
  return currentLocale;
}

/**
 * Verifica se um código de idioma é suportado.
 */
export function isValidLocale(code: string): code is SupportedLocale {
  return code in AVAILABLE_LOCALES;
}

// Carregar inglês como padrão ao importar
loadLocale('en');

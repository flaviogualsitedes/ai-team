/**
 * Skills de manipulação e leitura de sistema de arquivos.
 */

import { z } from 'zod';
import fs from 'node:fs/promises';
import path from 'node:path';
import { Skill } from './types.js';

/**
 * Skill: Ler conteúdo de um arquivo.
 */
export const readFileSkill: Skill = {
  name: 'read_file',
  description: 'Lê o conteúdo completo de um arquivo de texto no projeto.',
  parameters: z.object({
    filePath: z.string().describe('Caminho relativo do arquivo (ex: src/index.ts)'),
  }),
  execute: async ({ filePath }) => {
    try {
      const fullPath = path.resolve(process.cwd(), filePath);
      
      // Segurança: Não permitir ler fora do diretório do projeto
      if (!fullPath.startsWith(process.cwd())) {
        return { error: 'Acesso negado: Caminho fora do diretório do projeto.' };
      }

      const content = await fs.readFile(fullPath, 'utf-8');
      return { content };
    } catch (error) {
      return { error: `Erro ao ler arquivo: ${(error as Error).message}` };
    }
  },
};

/**
 * Skill: Listar arquivos de um diretório.
 */
export const listDirSkill: Skill = {
  name: 'list_dir',
  description: 'Lista os arquivos e pastas de um diretório específico.',
  parameters: z.object({
    dirPath: z.string().default('.').describe('Caminho do diretório (padrão é a raiz)'),
  }),
  execute: async ({ dirPath }) => {
    try {
      const fullPath = path.resolve(process.cwd(), dirPath);
      
      if (!fullPath.startsWith(process.cwd())) {
        return { error: 'Acesso negado: Caminho fora do diretório do projeto.' };
      }

      const files = await fs.readdir(fullPath, { withFileTypes: true });
      return {
        files: files.map(f => ({
          name: f.name,
          type: f.isDirectory() ? 'directory' : 'file'
        }))
      };
    } catch (error) {
      return { error: `Erro ao listar diretório: ${(error as Error).message}` };
    }
  },
};

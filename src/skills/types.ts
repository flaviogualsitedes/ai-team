/**
 * Definições de tipos para o sistema de Skills (Ferramentas) do AITeam.
 */

import { z } from 'zod';

/**
 * Interface base para uma Skill.
 * Mapeia diretamente para o conceito de 'tool' do Vercel AI SDK.
 */
export interface Skill {
  /** Nome único da ferramenta (snake_case) */
  name: string;
  /** Descrição detalhada para a IA entender quando usar */
  description: string;
  /** Schema dos parâmetros usando Zod */
  parameters: z.ZodType<any>;
  /** Função de execução real */
  execute: (args: any) => Promise<any>;
}

/**
 * Registro de Skills disponíveis.
 */
export interface SkillRegistry {
  [name: string]: Skill;
}

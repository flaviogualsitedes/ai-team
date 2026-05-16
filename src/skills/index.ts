/**
 * Exportador central de todas as Skills do AITeam.
 */

import { readFileSkill, listDirSkill } from './file-system.js';
import { SkillRegistry } from './types.js';

/**
 * Mapa de todas as ferramentas disponíveis para os agentes.
 */
export const ALL_SKILLS: SkillRegistry = {
  [readFileSkill.name]: readFileSkill,
  [listDirSkill.name]: listDirSkill,
};

/**
 * Converte as skills para o formato esperado pelo Vercel AI SDK.
 */
export function getToolsForSDK() {
  const tools: any = {};
  
  for (const skill of Object.values(ALL_SKILLS)) {
    tools[skill.name] = {
      description: skill.description,
      parameters: skill.parameters,
      execute: skill.execute,
    };
  }
  
  return tools;
}

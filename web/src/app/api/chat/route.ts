import { google } from '@ai-sdk/google';
import { streamText, tool } from 'ai';
import { getAgents, createAgent, deleteAgent, getApiKeys } from '@/lib/db';
import { nanoid } from 'nanoid';
import { z } from 'zod';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  // 1. Obter a chave do banco
  const apiKeys = getApiKeys();
  const geminiKey = apiKeys.find(k => k.provider === 'google')?.apiKey;

  if (!geminiKey) {
    return new Response('Configuração ausente: GEMINI_API_KEY não encontrada no banco.', { status: 400 });
  }

  // 2. Configurar o modelo
  const model = google('gemini-2.0-flash-exp', {
    apiKey: geminiKey
  });

  // 3. Executar o Stream com Tools
  const result = streamText({
    model,
    messages,
    system: `Você é o Magnus Mastermind, o cérebro supremo e mentor da operação no AITeam. 
    Seu objetivo é gerenciar e orquestrar o time de agentes de elite.
    
    DIRETRIZES DE NOMEAÇÃO (PADRÃO MARVEL):
    - Agentes DEVEM ter um nome próprio e um sobrenome funcional.
    - REGRA DE OURO: O nome e o sobrenome DEVEM começar com a mesma letra (Aliteração).
    - Exemplos: Pietra Pixel (Design), Dante Dev (Código), Sara Search (Busca), Vera Vector (AI).
    
    CAPACIDADES:
    - Você pode listar os agentes atuais para entender a equipe.
    - Você pode recrutar novos agentes de elite se o usuário solicitar.
    - Você pode remover agentes que não são mais necessários.
    
    TOM DE VOZ:
    - Profissional, pragmático, tecnológico e focado em eficiência.
    - Use termos como "recrutamento", "deploy", "squad" e "vetorização".`,
    tools: {
      listAgents: tool({
        description: 'Lista todos os agentes atualmente recrutados no AITeam.',
        parameters: z.object({}),
        execute: async () => {
          const agents = getAgents();
          return agents.map(a => ({
            id: a.id,
            name: a.name,
            role: a.role,
            model: a.model
          }));
        }
      }),
      recruitAgent: tool({
        description: 'Recruta um novo agente de elite para o time.',
        parameters: z.object({
          name: z.string().describe('Nome completo (Nome + Sobrenome Funcional)'),
          role: z.string().describe('Função específica do agente'),
          personality: z.string().describe('Descrição da personalidade e diretrizes'),
          model: z.string().describe('ID do modelo (ex: gemini-2.0-flash, gemini-1.5-pro)')
        }),
        execute: async ({ name, role, personality, model }) => {
          const id = nanoid();
          createAgent({ id, name, role, personality, model });
          return { success: true, agentId: id, message: `Agente ${name} recrutado com sucesso.` };
        }
      }),
      removeAgent: tool({
        description: 'Remove um agente do time pelo ID.',
        parameters: z.object({
          id: z.string().describe('ID único do agente')
        }),
        execute: async ({ id }) => {
          deleteAgent(id);
          return { success: true, message: 'Agente removido do sistema.' };
        }
      })
    }
  });

  return result.toDataStreamResponse();
}

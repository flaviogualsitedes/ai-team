/**
 * Catálogo de modelos de IA disponíveis no AITeam.
 *
 * Cada modelo é mapeado com seu provider, ID real para o Vercel AI SDK,
 * classificação de custo e features suportadas.
 */

/** Providers de LLM suportados */
export type ModelProvider = 'google' | 'anthropic' | 'openai' | 'ollama' | 'groq';

/** Classificação de custo */
export type ModelCost = 'free' | 'low' | 'medium' | 'high' | 'local';

/** Configuração completa de um modelo */
export interface ModelConfig {
  /** Identificador interno (usado em configs e CLI) */
  id: string;
  /** Nome legível para exibição */
  name: string;
  /** Provider do SDK */
  provider: ModelProvider;
  /** ID real passado ao SDK (ex: 'gemini-1.5-flash') */
  modelId: string;
  /** Classificação de custo */
  cost: ModelCost;
  /** Emoji indicador de custo */
  costEmoji: string;
  /** Custo estimado por 1k tokens (USD) */
  costPer1kTokens: number;
  /** Descrição curta para o menu de seleção */
  description: string;
  /** Se requer API key para funcionar */
  requiresKey: boolean;
  /** Nome da variável de ambiente da API key */
  envVar?: string;
  /** Package npm necessário */
  sdkPackage: string;
  /** Features suportadas */
  features: {
    thinking?: boolean;
    tools?: boolean;
    vision?: boolean;
    streaming?: boolean;
  };
}

/**
 * Catálogo completo de modelos disponíveis.
 * Ordenado por relevância e capacidade.
 */
export const MODELS: ModelConfig[] = [
  // === GOOGLE GEMINI (AI STUDIO) ===
  {
    id: 'gemini-2.0-flash-exp',
    name: 'Gemini 2.0 Flash (Exp)',
    provider: 'google',
    modelId: 'gemini-2.0-flash-exp',
    cost: 'free',
    costEmoji: '⚡ NEXT-GEN',
    costPer1kTokens: 0.0,
    description: 'Ultra velocidade e visão aprimorada (Experimental)',
    requiresKey: true,
    envVar: 'GOOGLE_GENERATIVE_AI_API_KEY',
    sdkPackage: '@ai-sdk/google',
    features: { tools: true, vision: true, streaming: true },
  },
  {
    id: 'gemini-2.0-pro-exp',
    name: 'Gemini 2.0 Pro (Exp)',
    provider: 'google',
    modelId: 'gemini-2.0-pro-exp-02-05',
    cost: 'free',
    costEmoji: '🧠 ELITE',
    costPer1kTokens: 0.0,
    description: 'Raciocínio complexo e janelas gigantes (Experimental)',
    requiresKey: true,
    envVar: 'GOOGLE_GENERATIVE_AI_API_KEY',
    sdkPackage: '@ai-sdk/google',
    features: { thinking: true, tools: true, vision: true, streaming: true },
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'google',
    modelId: 'gemini-1.5-pro',
    cost: 'low',
    costEmoji: '🟢 STABLE',
    costPer1kTokens: 0.00125,
    description: 'Equilíbrio perfeito entre inteligência e velocidade',
    requiresKey: true,
    envVar: 'GOOGLE_GENERATIVE_AI_API_KEY',
    sdkPackage: '@ai-sdk/google',
    features: { tools: true, vision: true, streaming: true },
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'google',
    modelId: 'gemini-1.5-flash',
    cost: 'free',
    costEmoji: '🟢 FAST',
    costPer1kTokens: 0.0001,
    description: 'Otimizado para tarefas rápidas e alto throughput',
    requiresKey: true,
    envVar: 'GOOGLE_GENERATIVE_AI_API_KEY',
    sdkPackage: '@ai-sdk/google',
    features: { tools: true, vision: true, streaming: true },
  },

  // === OPENAI ===
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    modelId: 'gpt-4o',
    cost: 'medium',
    costEmoji: '🟠 FLAGSHIP',
    costPer1kTokens: 0.005,
    description: 'Líder em versatilidade e seguimento de instruções',
    requiresKey: true,
    envVar: 'OPENAI_API_KEY',
    sdkPackage: '@ai-sdk/openai',
    features: { tools: true, vision: true, streaming: true },
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    modelId: 'gpt-4o-mini',
    cost: 'low',
    costEmoji: '🟢 ECONOMY',
    costPer1kTokens: 0.00015,
    description: 'Extremamente barato e surpreendentemente capaz',
    requiresKey: true,
    envVar: 'OPENAI_API_KEY',
    sdkPackage: '@ai-sdk/openai',
    features: { tools: true, vision: true, streaming: true },
  },

  // === ANTHROPIC ===
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    modelId: 'claude-3-5-sonnet-latest',
    cost: 'medium',
    costEmoji: '🟠 CODING',
    costPer1kTokens: 0.003,
    description: 'Padrão ouro para desenvolvimento e escrita natural',
    requiresKey: true,
    envVar: 'ANTHROPIC_API_KEY',
    sdkPackage: '@ai-sdk/anthropic',
    features: { thinking: true, tools: true, vision: true, streaming: true },
  },

  // === GROQ (ULTRA FAST) ===
  {
    id: 'llama-3.3-70b-groq',
    name: 'Llama 3.3 70B (Groq)',
    provider: 'groq',
    modelId: 'llama-3.3-70b-versatile',
    cost: 'low',
    costEmoji: '⚡ SPEED',
    costPer1kTokens: 0.0006,
    description: 'Respostas instantâneas via LPU hardware',
    requiresKey: true,
    envVar: 'GROQ_API_KEY',
    sdkPackage: '@ai-sdk/openai', // Groq usa SDK compatível com OpenAI
    features: { tools: true, streaming: true },
  },
];

/**
 * Busca um modelo pelo ID interno.
 */
export function getModelById(id: string): ModelConfig | undefined {
  return MODELS.find((m) => m.id === id);
}

/**
 * Retorna o modelo padrão (Gemini 1.5 Flash).
 */
export function getDefaultModel(): ModelConfig {
  return MODELS.find(m => m.id === 'gemini-1.5-flash') || MODELS[0];
}

/**
 * Agrupa modelos por classificação de custo.
 */
export function getModelsByCategory(): Record<string, ModelConfig[]> {
  return {
    free: MODELS.filter((m) => m.cost === 'free'),
    paid: MODELS.filter((m) => ['low', 'medium', 'high'].includes(m.cost)),
    local: MODELS.filter((m) => m.cost === 'local'),
  };
}

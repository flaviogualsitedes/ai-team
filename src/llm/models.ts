/**
 * Catálogo de modelos de IA disponíveis no AITeam.
 *
 * Cada modelo é mapeado com seu provider, ID real para o Vercel AI SDK,
 * classificação de custo e features suportadas.
 */

/** Providers de LLM suportados */
export type ModelProvider = 'google' | 'anthropic' | 'openai' | 'ollama';

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
  /** ID real passado ao SDK (ex: 'gemini-3-flash-preview') */
  modelId: string;
  /** Classificação de custo */
  cost: ModelCost;
  /** Emoji indicador de custo */
  costEmoji: string;
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
 * Ordenado por custo (gratuitos primeiro).
 */
export const MODELS: ModelConfig[] = [
  // === GRATUITOS / PREVIEW ===
  {
    id: 'gemini-3-flash',
    name: 'Gemini 3 Flash (Preview)',
    provider: 'google',
    modelId: 'gemini-3-flash-preview',
    cost: 'free',
    costEmoji: '🟢 NEW',
    description: 'Nova geração — Ultra rápido e inteligente',
    requiresKey: true,
    envVar: 'GOOGLE_GENERATIVE_AI_API_KEY',
    sdkPackage: '@ai-sdk/google',
    features: { tools: true, vision: true, streaming: true },
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'google',
    modelId: 'gemini-2.0-flash',
    cost: 'free',
    costEmoji: '🟢 STABLE',
    description: 'Alta performance e baixa latência',
    requiresKey: true,
    envVar: 'GOOGLE_GENERATIVE_AI_API_KEY',
    sdkPackage: '@ai-sdk/google',
    features: { tools: true, vision: true, streaming: true },
  },
  {
    id: 'gemini-flash-latest',
    name: 'Gemini 1.5 Flash (Latest)',
    provider: 'google',
    modelId: 'gemini-flash-latest',
    cost: 'free',
    costEmoji: '🟢 STABLE',
    description: 'O cavalo de batalha do Google',
    requiresKey: true,
    envVar: 'GOOGLE_GENERATIVE_AI_API_KEY',
    sdkPackage: '@ai-sdk/google',
    features: { tools: true, vision: true, streaming: true },
  },

  // === BAIXO CUSTO / PRO ===
  {
    id: 'gemini-3.1-pro',
    name: 'Gemini 3.1 Pro (Preview)',
    provider: 'google',
    modelId: 'gemini-3.1-pro-preview',
    cost: 'low',
    costEmoji: '🟡 $',
    description: 'Raciocínio de última geração (3.1)',
    requiresKey: true,
    envVar: 'GOOGLE_GENERATIVE_AI_API_KEY',
    sdkPackage: '@ai-sdk/google',
    features: { thinking: true, tools: true, vision: true, streaming: true },
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'google',
    modelId: 'gemini-2.5-pro',
    cost: 'low',
    costEmoji: '🟡 $',
    description: 'Modelo Pro de alta inteligência',
    requiresKey: true,
    envVar: 'GOOGLE_GENERATIVE_AI_API_KEY',
    sdkPackage: '@ai-sdk/google',
    features: { thinking: true, tools: true, vision: true, streaming: true },
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    modelId: 'gpt-4o-mini',
    cost: 'low',
    costEmoji: '🟡 $',
    description: 'Melhor custo-benefício da OpenAI',
    requiresKey: true,
    envVar: 'OPENAI_API_KEY',
    sdkPackage: '@ai-sdk/openai',
    features: { tools: true, vision: true, streaming: true },
  },

  // === MÉDIO ===
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    modelId: 'claude-3-5-sonnet-latest',
    cost: 'medium',
    costEmoji: '🟠 $$',
    description: 'O melhor para coding e raciocínio lógico',
    requiresKey: true,
    envVar: 'ANTHROPIC_API_KEY',
    sdkPackage: '@ai-sdk/anthropic',
    features: { thinking: true, tools: true, vision: true, streaming: true },
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    modelId: 'gpt-4o',
    cost: 'medium',
    costEmoji: '🟠 $$',
    description: 'O modelo flagship da OpenAI',
    requiresKey: true,
    envVar: 'OPENAI_API_KEY',
    sdkPackage: '@ai-sdk/openai',
    features: { tools: true, vision: true, streaming: true },
  },

  // === ALTO ===
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    modelId: 'claude-3-opus-latest',
    cost: 'high',
    costEmoji: '🔴 $$$',
    description: 'Raciocínio profundo para tarefas ultra-complexas',
    requiresKey: true,
    envVar: 'ANTHROPIC_API_KEY',
    sdkPackage: '@ai-sdk/anthropic',
    features: { thinking: true, tools: true, vision: true, streaming: true },
  },

  // === LOCAL ===
  {
    id: 'ollama',
    name: 'Ollama (Local)',
    provider: 'ollama',
    modelId: 'llama3.2',
    cost: 'local',
    costEmoji: '🟢 LOCAL',
    description: 'Modelos locais — privacidade total, zero custo',
    requiresKey: false,
    sdkPackage: 'ai-sdk-ollama',
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
 * Retorna o modelo padrão (Gemini 3 Flash).
 */
export function getDefaultModel(): ModelConfig {
  return MODELS[0];
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

import React from 'react';
import { 
  ShieldCheck, 
  Key, 
  Cpu, 
  Globe, 
  Save,
  CheckCircle2,
  AlertCircle,
  Server,
  Plus,
  Zap,
  Bot,
  Sparkles
} from "lucide-react";
import { getApiKeys, getSettings } from '@/lib/db';
import { updateApiKeysAction } from './actions';
import { cn } from '@/lib/utils';
import { ApiKeyInput } from './ApiKeyInput';
import { PreferencesForm } from './PreferencesForm';
import { MODELS } from '../../../../src/llm/models';

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const apiKeys = await getApiKeys();
  const settings = await getSettings();

  const providers = [
    { 
      id: 'google', 
      name: 'Google Gemini', 
      icon: Globe, 
      color: 'text-sky-400', 
      border: 'border-sky-500/20', 
      bg: 'bg-sky-500/5',
      description: 'Ideal para janelas de contexto massivas e integração multimodal nativa.'
    },
    { 
      id: 'openai', 
      name: 'OpenAI', 
      icon: Cpu, 
      color: 'text-emerald-400', 
      border: 'border-emerald-500/20', 
      bg: 'bg-emerald-500/5',
      description: 'Excelência em raciocínio lógico, codificação e seguimento de instruções complexas.'
    },
    { 
      id: 'anthropic', 
      name: 'Anthropic', 
      icon: ShieldCheck, 
      color: 'text-amber-400', 
      border: 'border-amber-500/20', 
      bg: 'bg-amber-500/5',
      description: 'Focado em segurança, escrita natural e análise detalhada de documentos.'
    },
    { 
      id: 'groq', 
      name: 'Groq Cloud', 
      icon: Zap, 
      color: 'text-orange-400', 
      border: 'border-orange-500/20', 
      bg: 'bg-orange-500/5',
      description: 'Performance extrema com LPU. Latência quase zero para respostas instantâneas.'
    },
  ];

  const activeProvidersIds = apiKeys.filter(k => k.apiKey).map(k => k.provider);
  const activeProvidersList = providers.filter(p => activeProvidersIds.includes(p.id));
  const activeModelsList = MODELS.filter(m => activeProvidersIds.includes(m.provider));

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <Server className="w-8 h-8 text-primary" />
            Configurações
          </h1>
          <p className="text-sm text-muted-foreground">O cérebro do seu ecossistema AITeam.</p>
        </div>
        <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-foreground px-5 py-3 rounded-2xl font-bold border border-white/5 transition-all text-sm group">
          <Plus className="w-4 h-4 text-primary group-hover:scale-125 transition-transform" />
          Nova Integração
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: General & Models */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-secondary/20 rounded-3xl border border-white/5 p-6 backdrop-blur-md">
            <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
              <Bot className="w-4 h-4" />
              Preferências
            </h3>
            
            <PreferencesForm 
              activeModelsList={activeModelsList}
              activeProvidersList={activeProvidersList.map(p => ({ id: p.id, name: p.name }))}
              initialSettings={settings}
            />
          </div>

          <div className="bg-secondary/20 border border-white/5 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Status do Vault
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                <span>Criptografia</span>
                <span className="text-emerald-500">AES-256-GCM</span>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[100%]" />
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                Sua chave mestra é gerada localmente e nunca sai do seu ambiente.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: API Keys */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-secondary/10 rounded-3xl border border-white/5 overflow-hidden">
            <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                <Key className="w-4 h-4 text-primary" />
                Hub de Conexões
              </h3>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">
                  Proteção Ativa
                </span>
              </div>
            </div>

            <form action={updateApiKeysAction} className="p-8 space-y-6">
              {providers.map(provider => {
                const hasKey = apiKeys.find(k => k.provider === provider.id);
                return (
                  <div key={provider.id} className={cn("p-6 rounded-2xl border transition-all space-y-4", provider.bg, provider.border)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center overflow-hidden border border-white/5">
                          <img 
                            src={`/logos/${provider.id}.png`} 
                            alt={provider.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-bold">{provider.name}</h4>
                          <p className="text-[10px] text-muted-foreground max-w-[280px] leading-tight">
                            {provider.description}
                          </p>
                        </div>
                      </div>
                      {hasKey ? (
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                          <CheckCircle2 className="w-3 h-3" />
                          Ativo
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-white/20 uppercase tracking-widest">
                          <AlertCircle className="w-3 h-3" />
                          Desconectado
                        </div>
                      )}
                    </div>
                    
                    <ApiKeyInput 
                      name={`${provider.id}_key`}
                      placeholder={`Insira sua chave ${provider.name}...`}
                      defaultValue={hasKey?.apiKey}
                      hasKey={!!hasKey}
                    />
                  </div>
                );
              })}

              <div className="flex justify-end pt-4">
                <button className="bg-primary text-primary-foreground px-10 py-4 rounded-2xl font-bold hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20">
                  <Save className="w-5 h-5" />
                  Salvar Todas as Chaves
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

import { getAgentDetails } from '@/lib/db';
import { 
  ArrowLeft, 
  Save, 
  Brain, 
  Sparkles, 
  Terminal,
  ShieldAlert,
  Cpu
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export const dynamic = "force-dynamic";

import { saveAgentAction } from '../actions';

export default async function AgentEditPage({ params }: { params: { id: string } }) {
  const agent = await getAgentDetails(params.id);

  if (!agent) {
    return <div className="p-8">Agente não encontrado.</div>;
  }

  // Prepara a ação com o ID fixo
  const updateWithId = saveAgentAction.bind(null, agent.id);

  return (
    <form action={updateWithId} className="max-w-5xl mx-auto space-y-8 pb-24 animate-in fade-in duration-700">
      {/* Header / Actions */}
      <div className="flex justify-between items-center bg-secondary/20 p-6 rounded-2xl border border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Link 
            href="/agents"
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{agent.name}</h1>
            <p className="text-sm text-muted-foreground">ID: {agent.id}</p>
          </div>
        </div>
        <button type="submit" className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold hover:opacity-90 transition-all active:scale-95 shadow-[0_0_20px_rgba(var(--primary),0.4)]">
          <Save className="w-5 h-5" />
          Salvar Alterações
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Core Identity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Identity Section */}
          <div className="bg-secondary/30 rounded-2xl border border-white/5 p-8 space-y-6">
            <div className="flex items-center gap-2 text-primary font-bold mb-4">
              <Brain className="w-5 h-5" />
              Identidade & Propósito
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Nome do Agente</label>
                <input 
                  name="name"
                  type="text" 
                  defaultValue={agent.name}
                  className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Cargo / Role</label>
                <input 
                  name="role"
                  type="text" 
                  defaultValue={agent.role}
                  className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Personalidade & Comportamento</label>
              <textarea 
                name="personality"
                rows={6}
                defaultValue={agent.personality}
                className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 transition-colors resize-none"
                placeholder="Descreva como o agente deve se comportar, seu tom de voz e traços de personalidade..."
              />
            </div>
          </div>

          {/* System Prompt Section */}
          <div className="bg-secondary/30 rounded-2xl border border-white/5 p-8 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <Terminal className="w-5 h-5" />
                System Prompt (Instruções Mestre)
              </div>
              <span className="text-[10px] bg-amber-400/10 text-amber-400 border border-amber-400/20 px-2 py-0.5 rounded uppercase font-bold tracking-tighter">
                CRITICAL
              </span>
            </div>
            <textarea 
              name="systemPrompt"
              rows={12}
              defaultValue={agent.systemPrompt}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 font-mono text-sm leading-relaxed focus:outline-none focus:border-amber-400/50 transition-colors resize-y"
              placeholder="Digite aqui as instruções que definem o comportamento base do seu agente..."
            />
          </div>
        </div>

        {/* Right Column: AI Engine Settings */}
        <div className="space-y-6">
          <div className="bg-secondary/30 rounded-2xl border border-white/5 p-8 space-y-8 h-fit">
            <div className="flex items-center gap-2 text-sky-400 font-bold">
              <Sparkles className="w-5 h-5" />
              AI Engine
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Modelo</label>
                <select name="model" defaultValue={agent.model} className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 appearance-none">
                  <option value="gpt-4o">GPT-4o</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                  <option value="gemini-3-flash">Gemini 3 Flash (Default)</option>
                </select>
              </div>

              <div className="pt-4 space-y-4 border-t border-white/5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Temperatura</label>
                </div>
                <input 
                  name="temperature"
                  type="range" 
                  min="0" 
                  max="100" 
                  defaultValue={(agent.temperature || 0.7) * 100}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

import { getAgents } from '@/lib/db';
import { 
  User, 
  Brain, 
  Target, 
  Cpu, 
  ExternalLink, 
  Settings2,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export const dynamic = "force-dynamic";

export default async function AgentsPage() {
  const agents = await getAgents();

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Seus Agentes</h1>
          <p className="text-muted-foreground">Gerencie a personalidade e as capacidades técnicas do seu time de IA.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold hover:opacity-90 transition-all active:scale-95 shadow-[0_0_15px_rgba(var(--primary),0.3)]">
          <Plus className="w-5 h-5" />
          Novo Agente
        </button>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <div 
            key={agent.id}
            className="group relative bg-secondary/30 border border-white/5 rounded-2xl p-6 hover:bg-secondary/50 transition-all duration-300 hover:border-primary/30"
          >
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
            
            <div className="relative space-y-6">
              {/* Header: Name & Icon */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground/90 group-hover:text-primary transition-colors">{agent.name}</h3>
                    <p className="text-sm text-primary/80 font-medium tracking-wide uppercase">{agent.role}</p>
                  </div>
                </div>
                <Link 
                  href={`/agents/${agent.id}`}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Settings2 className="w-5 h-5" />
                </Link>
              </div>

              {/* Goal Section */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  <Brain className="w-3 h-3" />
                  Personalidade & Estilo
                </div>
                <p className="text-sm text-foreground/70 line-clamp-2 min-h-[40px]">
                  {agent.personality || "Nenhuma personalidade definida."}
                </p>
              </div>

              {/* Capabilities / Tech Stack */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-primary/60" />
                  <span className="text-xs font-mono text-muted-foreground">
                    {agent.model}
                  </span>
                </div>
                <div className="flex -space-x-2">
                  {/* Mock de skills/capacidades */}
                  {[1, 2, 3].map((s) => (
                    <div key={s} className="w-6 h-6 rounded-full border-2 border-background bg-secondary flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}

        {agents.length === 0 && (
          <div className="col-span-full py-20 text-center bg-secondary/20 border border-dashed border-white/10 rounded-2xl">
            <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground italic">Nenhum agente cadastrado ainda. Vamos criar o primeiro?</p>
          </div>
        )}
      </div>
    </div>
  );
}

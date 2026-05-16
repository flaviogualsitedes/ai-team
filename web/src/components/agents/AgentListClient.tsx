'use client';

import { useState } from 'react';
import { 
  User, 
  Settings2, 
  Plus, 
  Activity, 
  ShieldCheck, 
  Timer, 
  Layers, 
  Coins, 
  Users, 
  Briefcase, 
  Brain,
  Cpu,
  Fingerprint
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { IdentityModal } from './IdentityModal';
import { RecruitmentModal } from './RecruitmentModal';

interface AgentListClientProps {
  initialAgents: any[];
}

function DNAStat({ icon: Icon, label, value, color }: { icon: any, label: string, value: number, color: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 flex-1 group/stat min-w-0">
      <div className="flex items-center gap-1 opacity-60 group-hover/stat:opacity-100 transition-opacity">
        <Icon className={cn("w-3 h-3", color)} />
        <span className="text-[8px] font-black uppercase tracking-tighter truncate">{label}</span>
      </div>
      <span className={cn("text-[13px] font-black tracking-tighter", color)}>{value.toFixed(0)}%</span>
    </div>
  );
}

export function AgentListClient({ initialAgents }: AgentListClientProps) {
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [isRecruiting, setIsRecruiting] = useState(false);

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* HEADER INTEGRADO NO CLIENTE PARA CONTROLAR O MODAL */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Seus Agentes</h1>
          <p className="text-muted-foreground font-medium italic text-sm">Gestão e evolução técnica do seu squad.</p>
        </div>
        <button 
          onClick={() => setIsRecruiting(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-black hover:opacity-90 transition-all active:scale-95 shadow-[0_0_20px_rgba(var(--primary),0.3)]"
        >
          <Plus className="w-5 h-5" />
          Novo Agente
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {initialAgents.map((agent) => (
          <div 
            key={agent.id}
            className="group relative bg-secondary/10 border border-white/5 rounded-[2.5rem] p-7 hover:bg-secondary/20 transition-all duration-500 hover:border-primary/20 hover:shadow-[0_25px_50px_rgba(0,0,0,0.4)] flex flex-col h-full min-h-[410px]"
          >
            {/* ... rest of header ... */}
            <div className="flex justify-between items-start mb-6 shrink-0">
              <div className="flex gap-4 min-w-0 flex-1">
                <div className="relative group/avatar">
                   <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-transparent border border-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform duration-500 shadow-inner shrink-0 overflow-hidden">
                    <User className="w-8 h-8" />
                  </div>
                  <button 
                    onClick={() => setSelectedAgent(agent)}
                    className="absolute -right-2 -bottom-2 w-8 h-8 rounded-full bg-black border border-white/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-lg scale-0 group-hover/avatar:scale-100"
                    title="Ver Identidade Digital"
                  >
                    <Fingerprint className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex flex-col justify-center min-w-0 pr-4">
                  <h3 className="text-xl font-black tracking-tighter text-foreground leading-[1.0] mb-2 uppercase break-words">
                    <span className="block">{agent.name.split(' ')[0]}</span>
                    <span className="block text-primary/80">{agent.name.split(' ').slice(1).join(' ')}</span>
                  </h3>
                  <div className="flex flex-col gap-1.5">
                    <div className={cn(
                      "px-2 py-0.5 rounded-md text-[8px] font-black border tracking-[0.1em] w-fit uppercase",
                      agent.category.color
                    )}>
                      {agent.role || 'AGENT'}
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground/30">
                      <Cpu className="w-2.5 h-2.5" />
                      <span className="text-[8px] font-black uppercase tracking-widest truncate">{agent.model}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <Link href={`/agents/${agent.id}`} className="p-2.5 rounded-2xl bg-white/5 hover:bg-primary hover:text-primary-foreground transition-all duration-300 border border-white/5 shrink-0">
                <Settings2 className="w-4 h-4" />
              </Link>
            </div>

            {/* DESCRIPTION BOX */}
            <button 
              onClick={() => setSelectedAgent(agent)}
              className="w-full text-left bg-black/30 px-6 py-5 rounded-[1.8rem] border border-white/5 mb-5 relative overflow-hidden flex items-center justify-center h-[90px] shrink-0 group/desc hover:bg-black/50 transition-colors"
            >
              <div className="absolute -right-4 -bottom-6 opacity-[0.04] group-hover/desc:opacity-[0.08] transition-opacity pointer-events-none rotate-12">
                 <Brain className="w-24 h-24" />
              </div>
              <p className="text-center text-[12px] text-muted-foreground leading-relaxed italic font-medium line-clamp-3 relative z-10 group-hover/desc:text-foreground transition-colors">
                "{agent.personality || "Diretrizes operacionais padrão carregadas."}"
              </p>
            </button>

            {/* DNA STATS */}
            <div className="flex items-center justify-between gap-1 px-1 mb-4">
              <DNAStat icon={Activity} label="Efficiency" value={agent.dna.efficiency} color="text-primary" />
              <DNAStat icon={ShieldCheck} label="Reliability" value={agent.dna.reliability} color="text-emerald-400" />
              <DNAStat icon={Timer} label="Speed" value={agent.dna.speed} color="text-sky-400" />
              <DNAStat icon={Layers} label="Versatility" value={agent.dna.versatility} color="text-purple-400" />
              <DNAStat icon={Coins} label="Economy" value={agent.dna.economy} color="text-amber-400" />
            </div>

            {/* LEVEL PROGRESS & FOOTER */}
            <div className="mt-auto pt-5 border-t border-white/10 flex items-center justify-between gap-6 shrink-0">
              <div className="flex items-center gap-4 flex-1">
                <div className="flex flex-col gap-1.5 shrink-0">
                  <div className="flex items-center gap-2">
                    <Users className="w-3 h-3 text-blue-500/50" />
                    <span className="text-[10px] font-black text-foreground/80">{agent.squadCount}<span className="text-[8px] text-muted-foreground ml-1 uppercase italic">Sqd</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-3 h-3 text-amber-500/50" />
                    <span className="text-[10px] font-black text-foreground/80">{agent.projectCount}<span className="text-[8px] text-muted-foreground ml-1 uppercase italic">Prj</span></span>
                  </div>
                </div>

                <div className="flex-1 flex flex-col gap-1.5 translate-y-0.5">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">Level Progress</span>
                    <span className="text-[7px] font-black text-primary/40 uppercase tracking-widest">{agent.xpProgress.toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="h-full bg-primary/40 rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(var(--primary),0.3)]" 
                      style={{ width: `${agent.xpProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 px-4 py-2.5 rounded-2xl border border-primary/10 flex flex-col items-center justify-center min-w-[55px]">
                <span className="text-[8px] font-black text-primary/40 mb-0.5 uppercase tracking-widest">LVL</span>
                <span className="text-lg font-black text-primary leading-none">{agent.level}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <IdentityModal 
        isOpen={!!selectedAgent}
        onClose={() => setSelectedAgent(null)}
        agentName={selectedAgent?.name || ''}
        personality={selectedAgent?.personality || ''}
      />

      <RecruitmentModal 
        isOpen={isRecruiting}
        onClose={() => setIsRecruiting(false)}
      />
    </div>
  );
}

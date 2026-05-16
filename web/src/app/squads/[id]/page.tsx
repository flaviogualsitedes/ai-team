import React from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  UserPlus, 
  Trash2, 
  GripVertical,
  Cpu,
  Brain,
  MessageSquareQuote,
  ShieldCheck,
  Zap
} from "lucide-react";
import { getSquadDetails, getAgents } from '@/lib/db';
import { cn } from '@/lib/utils';

export const dynamic = "force-dynamic";

export default async function SquadDetailPage({ params }: { params: { id: string } }) {
  const squad = await getSquadDetails(params.id);
  const allAgents = await getAgents();

  if (!squad) {
    return <div className="p-8">Squad não encontrada.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24 animate-in fade-in duration-700">
      {/* Header / Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-secondary/20 p-6 rounded-3xl border border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Link 
            href="/squads"
            className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{squad.name}</h1>
              <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">
                {squad.pipeline}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Gerenciamento de membros e recrutamento de especialistas.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white/5 text-foreground px-6 py-3 rounded-2xl font-bold hover:bg-white/10 transition-all">
            Visualizar Pipeline
          </button>
          <button className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-bold hover:opacity-90 transition-all shadow-[0_0_20px_rgba(var(--primary),0.4)]">
            <Save className="w-5 h-5" />
            Salvar Squad
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Squad Members (The Active Squad) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-secondary/20 rounded-3xl border border-white/5 overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-2 font-bold">
                <ShieldCheck className="w-5 h-5 text-sky-400" />
                Membros Recrutados
              </div>
              <span className="text-xs text-muted-foreground">{squad.members.length} Agentes Ativos</span>
            </div>

            <div className="p-6 space-y-4">
              {squad.members.length === 0 ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                    <UserPlus className="w-8 h-8 text-muted-foreground/30" />
                  </div>
                  <p className="text-muted-foreground">Nenhum membro recrutado. Arraste agentes do pool para este squad.</p>
                </div>
              ) : (
                squad.members.map((member, index) => (
                  <div 
                    key={member.agentId}
                    className="group bg-background/40 hover:bg-background/60 rounded-2xl border border-white/5 p-5 transition-all relative"
                  >
                    <div className="flex items-start gap-4">
                      <div className="cursor-grab p-1 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors">
                        <GripVertical className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-bold text-foreground">{member.name}</h4>
                              <p className="text-xs text-muted-foreground uppercase tracking-widest">{member.roleInSquad || member.baseRole}</p>
                            </div>
                          </div>
                          <button className="p-2 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Override Field */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-[10px] font-black text-amber-500 uppercase tracking-widest ml-1">
                            <MessageSquareQuote className="w-3 h-3" />
                            Instrução Específica para esta Squad (Override)
                          </div>
                          <textarea 
                            defaultValue={member.promptOverride}
                            placeholder="Descreva o papel específico deste agente nesta squad..."
                            rows={2}
                            className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/30 transition-all resize-none"
                          />
                        </div>

                        <div className="flex items-center gap-4 pt-2">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground">
                            <Cpu className="w-3 h-3" />
                            {member.model}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Agent Pool (Talent Pool) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-secondary/30 rounded-3xl border border-white/5 p-6 h-fit sticky top-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 font-bold text-primary">
                <Brain className="w-5 h-5" />
                Pool de Agentes
              </div>
              <Link href="/agents" className="text-[10px] text-muted-foreground hover:text-primary transition-colors uppercase font-bold tracking-widest">
                Gerenciar Todos
              </Link>
            </div>

            <div className="space-y-3">
              {allAgents.filter(a => !squad.members.some(m => m.agentId === a.id)).map(agent => (
                <div 
                  key={agent.id}
                  className="bg-white/5 hover:bg-white/10 rounded-2xl p-4 border border-white/5 transition-all group flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold">{agent.name}</h5>
                      <p className="text-[10px] text-muted-foreground line-clamp-1">{agent.role}</p>
                    </div>
                  </div>
                  <button className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              <Link 
                href="/agents"
                className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl border-2 border-dashed border-white/10 text-muted-foreground hover:text-foreground hover:border-white/20 transition-all text-sm font-bold"
              >
                <Plus className="w-4 h-4" />
                Criar Novo Talento
              </Link>
            </div>
          </div>

          {/* Tips Card */}
          <div className="bg-amber-500/5 border border-amber-500/10 rounded-3xl p-6 space-y-3">
            <h4 className="text-amber-500 font-bold text-sm flex items-center gap-2">
              💡 Dica do Architect
            </h4>
            <p className="text-xs text-amber-500/70 leading-relaxed italic">
              "Recrutar os membros certos é apenas metade do trabalho. O segredo está nos Overrides de Prompt: seja específico sobre o que este agente deve entregar para o próximo membro da squad."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

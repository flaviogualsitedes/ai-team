import { getExecutionDetails } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  ChevronLeft, 
  Clock, 
  Coins, 
  Cpu, 
  CheckCircle2, 
  AlertCircle,
  MessageSquare,
  User,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ExecutionDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const execution = getExecutionDetails(id);

  if (!execution) {
    notFound();
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header / Breadcrumbs */}
      <div className="flex flex-col gap-4">
        <Link 
          href="/executions" 
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ChevronLeft className="w-4 h-4" /> Voltar para Execuções
        </Link>
        <div className="flex justify-between items-end">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold tracking-tight">{execution.squadName}</h1>
              <span className={cn(
                "text-[10px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest h-fit",
                execution.status?.toUpperCase() === 'COMPLETED' && "text-green-400 bg-green-400/10 border-green-400/20",
                execution.status?.toUpperCase() === 'FAILED' && "text-red-400 bg-red-400/10 border-red-400/20",
                execution.status?.toUpperCase() === 'PENDING' && "text-orange-400 bg-orange-400/10 border-orange-400/20 animate-status-orbit",
                execution.status?.toUpperCase() === 'RUNNING' && "text-sky-400 bg-sky-400/10 border-sky-400/20 animate-status-orbit"
              )}>
                {execution.status}
              </span>
            </div>
            <p className="text-muted-foreground max-w-2xl">{execution.squadDescription || "Execução do fluxo de trabalho do squad."}</p>
          </div>
          
          <div className="flex gap-6 text-right">
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Duração</div>
              <div className="font-mono text-xl">{(execution.durationMs / 1000).toFixed(1)}s</div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Custo</div>
              <div className="text-emerald-400 font-bold text-xl">${execution.totalCostUsd.toFixed(4)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Tokens Processados</div>
            <div className="text-xl font-bold">{new Intl.NumberFormat().format(execution.totalTokens)}</div>
          </div>
        </div>
        <div className="glass-panel p-4 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Passos Realizados</div>
            <div className="text-xl font-bold">{execution.steps.length} Etapas</div>
          </div>
        </div>
        <div className="glass-panel p-4 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Início da Tarefa</div>
            <div className="text-sm font-medium">{new Date(execution.createdAt).toLocaleString('pt-BR')}</div>
          </div>
        </div>
      </div>

      {/* Timeline of Steps */}
      <div className="space-y-6 relative before:absolute before:left-[27px] before:top-2 before:bottom-2 before:w-px before:bg-white/10">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-cyan-400" /> Linha do Tempo
        </h2>

        {execution.steps.map((step: any, index: number) => (
          <div key={step.id} className="relative pl-16 group">
            {/* Step Marker */}
            <div className={cn(
              "absolute left-0 top-0 w-[54px] h-[54px] rounded-2xl border flex items-center justify-center z-10 transition-all",
              step.status === 'completed' 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                : "bg-white/5 border-white/10 text-muted-foreground"
            )}>
              <span className="text-lg font-black">{step.step_number}</span>
            </div>

            {/* Step Content Card */}
            <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden group-hover:border-white/10 transition-all">
              <div className="p-6 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground flex items-center gap-2">
                      {step.agentName}
                      <span className="text-[10px] font-medium bg-white/5 px-2 py-0.5 rounded-full text-muted-foreground border border-white/5">
                        {step.agentRole}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> {step.tokensUsed} tokens</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {(step.durationMs / 1000).toFixed(1)}s</span>
                    </div>
                  </div>
                </div>
                <div className="text-emerald-400 font-mono text-sm font-bold">
                  + ${step.costUsd.toFixed(4)}
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                {step.input_summary && (
                  <div className="space-y-2">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Objetivo / Input</div>
                    <div className="text-sm text-foreground/80 leading-relaxed bg-black/20 p-4 rounded-xl border border-white/5">
                      {step.input_summary}
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Resposta do Agente</div>
                  <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap font-sans">
                    {step.output_full || step.output_summary}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

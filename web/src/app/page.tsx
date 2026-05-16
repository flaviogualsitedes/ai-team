import { getDashboardStats, getSettings, getApiKeys } from "@/lib/db";
import { StatCard } from "@/components/dashboard/StatCard";
import { 
  Zap, 
  Cpu, 
  Users, 
  Coins, 
  ArrowUpRight,
  Activity,
  History,
  ShieldCheck,
  Database as DbIcon
} from "lucide-react";
import Link from "next/link";
import { LiveActivityFeed } from "@/components/dashboard/LiveActivityFeed";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function Home() {
  const stats = await getDashboardStats();
  const settings = await getSettings();
  
  const activeProvidersCount = stats.providerStats.length;
  
  const providerColors: Record<string, string> = {
    google: "text-sky-400 bg-sky-400",
    openai: "text-emerald-400 bg-emerald-400",
    anthropic: "text-amber-400 bg-amber-400",
    groq: "text-orange-400 bg-orange-400"
  };

  const defaultModel = settings.default_model || "Não definido";
  const defaultProvider = settings.default_provider || "Nenhum";

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2 flex items-center gap-3">
            Dashboard
          </h1>
          <p className="text-muted-foreground font-medium">Cockpit do seu ecossistema de agentes.</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20 flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">AITeam Engine Active</span>
          </div>
          <div className="bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 flex items-center gap-2">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Default LLM:</span>
            <span className="text-[10px] font-black text-primary uppercase">{defaultModel}</span>
            <span className="text-[9px] font-bold text-white/20">|</span>
            <span className="text-[10px] font-black text-foreground/70 uppercase">{defaultProvider}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total de Execuções" 
          value={stats.totalExecutions} 
          icon={Activity} 
          color="blue"
        />
        <StatCard 
          label="Agentes Ativos" 
          value={stats.totalAgents} 
          icon={Users} 
          color="cyan"
        />
        <StatCard 
          label="Tokens Processados" 
          value={new Intl.NumberFormat().format(stats.totalTokens)} 
          icon={Cpu} 
          color="amber"
        />
        <StatCard 
          label="Custo Estimado" 
          value={`$${stats.totalCost.toFixed(4)}`} 
          icon={Coins} 
          color="emerald"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-secondary/10 p-8 rounded-3xl border border-white/5 relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Zap className="w-48 h-48 text-primary" fill="currentColor" />
            </div>
            
            <div className="relative z-10">
              <h2 className="text-3xl font-black mb-4">Orquestrar Squad</h2>
              <p className="text-muted-foreground mb-8 max-w-md text-lg leading-relaxed">
                Combine habilidades únicas para resolver problemas complexos. 
                Seu cockpit de monitoramento está pronto.
              </p>
              <div className="flex gap-4">
                <button className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-black hover:shadow-[0_0_25px_rgba(var(--primary),0.4)] transition-all flex items-center gap-2">
                  <Zap className="w-5 h-5 fill-current" />
                  Iniciar Nova Squad
                </button>
                <Link href="/executions" className="bg-white/5 px-8 py-4 rounded-2xl font-bold hover:bg-white/10 transition-all inline-flex items-center gap-2 border border-white/5">
                  Histórico Completo <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* REAL-TIME LIVE FEED */}
          <div className="bg-secondary/20 p-8 rounded-3xl border border-white/5 backdrop-blur-md shadow-xl">
            <LiveActivityFeed />
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-primary/10 p-8 rounded-3xl border border-primary/20 relative overflow-hidden">
             <div className="relative z-10">
                <h3 className="font-black text-xl mb-4 text-primary uppercase tracking-widest">Insight da IA</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium italic">
                  "Agentes com Gemini 1.5 Pro configurados com temperatura baixa são 40% mais eficientes em tarefas de depuração de código."
                </p>
             </div>
          </div>
          
          <div className="bg-secondary/20 p-8 rounded-3xl border border-white/5 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-black text-lg uppercase tracking-widest text-foreground/80">Infraestrutura</h3>
              <div className="px-2 py-1 bg-primary/10 rounded-lg text-[10px] font-black text-primary border border-primary/20">
                {activeProvidersCount} PROVEDORES ONLINE
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex justify-between items-center group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-primary/30 transition-colors">
                    <DbIcon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-bold text-muted-foreground">Status do Banco</span>
                </div>
                <span className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase">
                  SQLite Active
                </span>
              </div>

              <div className="flex justify-between items-center group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-emerald-500/30 transition-colors">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  </div>
                  <span className="text-sm font-bold text-muted-foreground">Vault Security</span>
                </div>
                <span className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase">
                  Armed
                </span>
              </div>

              {/* Providers Detail List */}
              <div className="pt-4 space-y-6">
                <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Conexões Ativas</div>
                
                {stats.providerStats.map((pStat: any) => {
                  const colors = providerColors[pStat.provider] || "text-white bg-white";
                  const colorClass = colors.split(' ')[0];
                  const bgClass = colors.split(' ')[1];

                  return (
                    <div key={pStat.provider} className="space-y-3 relative pl-4 border-l border-white/5 hover:border-primary/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", bgClass)} />
                          <span className="text-sm font-black uppercase tracking-tight">{pStat.provider}</span>
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground">Ativo</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-[9px] font-bold text-white/20 uppercase">Modelo</p>
                          <p className={cn("text-[10px] font-black truncate", colorClass)}>{pStat.model}</p>
                        </div>
                        <div className="space-y-1 text-right">
                          <p className="text-[9px] font-bold text-white/20 uppercase">Uso</p>
                          <p className="text-[10px] font-black text-foreground">{(pStat.tokens / 1000).toFixed(1)}k <span className="text-[8px] opacity-40">tk</span></p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center p-2 rounded-lg bg-white/[0.02] border border-white/5">
                        <span className="text-[9px] font-bold text-white/20 uppercase">Investimento</span>
                        <span className="text-[11px] font-black text-emerald-500">${pStat.cost.toFixed(4)}</span>
                      </div>
                    </div>
                  );
                })}

                {activeProvidersCount === 0 && (
                  <div className="text-center py-4 text-[10px] font-bold text-white/10 uppercase italic">
                    Nenhuma conexão configurada
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

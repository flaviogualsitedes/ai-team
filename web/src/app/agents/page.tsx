import { getAgents } from '@/lib/db';
import { 
  User, 
  Settings2,
  Plus,
  Zap,
  Cpu,
  Activity,
  ShieldCheck,
  Timer,
  Layers,
  Coins,
  Users,
  Briefcase,
  Brain
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export const dynamic = "force-dynamic";

/**
 * Lógica de Leveling Avançada (Volume + Performance)
 * XP Base = (projectCount * 10) + (squadCount * 25)
 * Multiplicador = Média do DNA (0.0 a 1.0)
 * XP Final = XP Base * Multiplicador
 */
function calculateLevelData(projectCount: number, squadCount: number, dna: any) {
  // Média simples das 5 métricas de performance (0 a 100)
  const avgPerformance = (
    dna.efficiency + 
    dna.reliability + 
    dna.speed + 
    dna.versatility + 
    dna.economy
  ) / 5;

  const multiplier = avgPerformance / 100; // Converte para fator de 0.0 a 1.0
  const totalXP = ((projectCount * 10) + (squadCount * 25)) * multiplier;
  
  const currentLevel = Math.floor(Math.sqrt(totalXP / 5)) + 1;
  
  const xpForCurrent = Math.pow(currentLevel - 1, 2) * 5;
  const xpForNext = Math.pow(currentLevel, 2) * 5;
  
  const progressInLevel = totalXP - xpForCurrent;
  const totalNeededInLevel = xpForNext - xpForCurrent;
  
  const percentage = Math.min(100, Math.max(totalXP > 0 ? 5 : 0, (progressInLevel / totalNeededInLevel) * 100));
  
  return {
    level: Math.min(999, currentLevel),
    percentage
  };
}

const CATEGORY_MAP: Record<string, { label: string, color: string }> = {
  developer: { label: 'DEV', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  marketing: { label: 'MKT', color: 'text-pink-400 bg-pink-400/10 border-pink-400/20' },
  video: { label: 'VID', color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
  architect: { label: 'ARCH', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
  researcher: { label: 'SRCH', color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20' },
  tester: { label: 'TEST', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
};

function getCategory(role: string = '') {
  const r = role.toLowerCase();
  if (r.includes('dev') || r.includes('desenvolvedor') || r.includes('coder')) return CATEGORY_MAP.developer;
  if (r.includes('mkt') || r.includes('marketing')) return CATEGORY_MAP.marketing;
  if (r.includes('video') || r.includes('maker')) return CATEGORY_MAP.video;
  if (r.includes('arch') || r.includes('arquiteto')) return CATEGORY_MAP.architect;
  if (r.includes('pesquisa') || r.includes('search')) return CATEGORY_MAP.researcher;
  if (r.includes('test')) return CATEGORY_MAP.tester;
  return { label: 'AGN', color: 'text-slate-400 bg-slate-400/10 border-slate-400/20' };
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

export default async function AgentsPage() {
  const agentsFromDb = await getAgents();
  
  const agents = agentsFromDb.map(agent => {
    const successRate = agent.successRate || 0;
    const squadCount = agent.squadCount || 0;
    const projectCount = agent.projectCount || 0;
    const avgDuration = agent.avgDuration || 0;
    
    // DNA Calculado
    const dna = {
      efficiency: Math.min(100, (successRate * 0.7) + (projectCount * 5)),
      reliability: successRate,
      speed: avgDuration > 0 ? Math.max(10, 100 - (avgDuration / 200)) : 100,
      versatility: Math.min(100, (squadCount * 20) + (projectCount * 5)),
      economy: agent.totalCost > 0 ? Math.max(20, 100 - (agent.totalCost * 100)) : 100,
    };

    // Agora o nível depende da PERFORMANCE (DNA)
    const levelData = calculateLevelData(projectCount, squadCount, dna);

    return {
      ...agent,
      category: getCategory(agent.role),
      level: levelData.level,
      dna,
      xpProgress: levelData.percentage
    };
  });

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Seus Agentes</h1>
          <p className="text-muted-foreground font-medium italic">Gestão e evolução técnica do seu squad.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-black hover:opacity-90 transition-all active:scale-95 shadow-[0_0_20px_rgba(var(--primary),0.3)]">
          <Plus className="w-5 h-5" />
          Novo Agente
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <div 
            key={agent.id}
            className="group relative bg-secondary/10 border border-white/5 rounded-[2.5rem] p-7 hover:bg-secondary/20 transition-all duration-500 hover:border-primary/20 hover:shadow-[0_25px_50px_rgba(0,0,0,0.4)] flex flex-col h-full min-h-[410px]"
          >
            {/* HEADER */}
            <div className="flex justify-between items-start mb-6 shrink-0">
              <div className="flex gap-4 min-w-0 flex-1">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-transparent border border-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform duration-500 shadow-inner shrink-0 overflow-hidden">
                  <User className="w-8 h-8" />
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
            <div className="bg-black/30 px-6 py-5 rounded-[1.8rem] border border-white/5 mb-5 relative overflow-hidden flex items-center justify-center h-[90px] shrink-0 group/desc">
              <div className="absolute -right-4 -bottom-6 opacity-[0.04] group-hover/desc:opacity-[0.08] transition-opacity pointer-events-none rotate-12">
                 <Brain className="w-24 h-24" />
              </div>
              <p className="text-center text-[12px] text-muted-foreground leading-relaxed italic font-medium line-clamp-3 relative z-10">
                "{agent.personality || "Diretrizes operacionais padrão carregadas."}"
              </p>
            </div>

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
    </div>
  );
}

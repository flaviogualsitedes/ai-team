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

import { AgentListClient } from '@/components/agents/AgentListClient';

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
    <AgentListClient initialAgents={agents} />
  );
}

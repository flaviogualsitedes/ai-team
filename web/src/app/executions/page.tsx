import { getExecutions } from "@/lib/db";
import Link from "next/link";
import { 
  History, 
  Search, 
  Filter, 
  MoreHorizontal,
  Clock,
  Coins,
  Cpu,
  ChevronRight
} from "lucide-react";
import { cn } from '@/lib/utils';

export const dynamic = "force-dynamic";

export default async function ExecutionsPage() {
  const executions = await getExecutions();

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Execuções</h1>
          <p className="text-muted-foreground">Histórico completo de atividades dos seus squads.</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex gap-4 items-center bg-white/5 p-2 rounded-2xl border border-white/5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Buscar por squad ou tarefa..." 
            className="w-full bg-transparent border-none focus:ring-0 text-sm pl-10 h-10"
          />
        </div>
        <div className="w-px h-6 bg-white/10" />
        <button className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-xl text-sm font-medium transition-all">
          <Filter className="w-4 h-4" /> Filtros
        </button>
      </div>

      {/* Table Section */}
      <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/5">
              <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">Data / Squad</th>
              <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">Projeto</th>
              <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">Tokens</th>
              <th className="px-6 py-4 text-sm font-semibold text-muted-foreground text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {executions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic">
                  Nenhuma execução encontrada no histórico.
                </td>
              </tr>
            ) : (
              executions.map((exec) => (
                <tr key={exec.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <Link href={`/executions/${exec.id}`} className="block group/link">
                      <div className="font-bold text-foreground mb-0.5 group-hover/link:text-cyan-400 transition-colors flex items-center gap-2">
                        {exec.squadName}
                        <ChevronRight className="w-3 h-3 opacity-0 group-hover/link:opacity-100 -translate-x-2 group-hover/link:translate-x-0 transition-all" />
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> 
                        {new Date(exec.createdAt).toLocaleString('pt-BR')}
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                        <span className="text-sm font-bold text-foreground/90">{exec.projectName}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[200px]" title={exec.projectPath}>
                        {exec.projectPath}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-[10px] font-black px-3 py-1 rounded-full border uppercase tracking-widest block w-fit",
                      exec.status?.toUpperCase() === 'COMPLETED' && "text-green-400 bg-green-400/10 border-green-400/20",
                      exec.status?.toUpperCase() === 'FAILED' && "text-red-400 bg-red-400/10 border-red-400/20",
                      exec.status?.toUpperCase() === 'PENDING' && "text-orange-400 bg-orange-400/10 border-orange-400/20 animate-status-orbit",
                      exec.status?.toUpperCase() === 'RUNNING' && "text-sky-400 bg-sky-400/10 border-sky-400/20 animate-status-orbit"
                    )}>
                      {exec.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Cpu className="w-4 h-4 text-amber-400/50" />
                      {new Intl.NumberFormat().format(exec.totalTokens)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-all text-muted-foreground hover:text-foreground">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="flex justify-between items-center px-4">
        <p className="text-sm text-muted-foreground">
          Exibindo as últimas <span className="text-foreground font-bold">{executions.length}</span> execuções.
        </p>
        <div className="flex gap-2">
          <button className="glass-panel px-4 py-2 rounded-xl text-sm font-medium opacity-50 cursor-not-allowed">Anterior</button>
          <button className="glass-panel px-4 py-2 rounded-xl text-sm font-medium opacity-50 cursor-not-allowed">Próxima</button>
        </div>
      </div>
    </div>
  );
}

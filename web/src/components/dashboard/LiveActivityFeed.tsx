'use client';

import React, { useState, useEffect } from 'react';
import { Activity, History, Zap, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LiveActivityFeed() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/telemetry');
        const json = await res.json();
        setData(json);
        setLoading(false);
      } catch (e) {
        console.error('Erro na telemetria:', e);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000); // Atualiza a cada 3 segundos
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Iniciando Telemetria...
      </div>
    );
  }

  const executions = data?.recentExecutions || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary animate-pulse" /> Monitor de Atividade
        </h3>
        <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-full font-bold uppercase tracking-tighter">
          Live
        </span>
      </div>

      <div className="space-y-3">
        {executions.length > 0 ? (
          executions.map((exec: any) => (
            <div 
              key={exec.id} 
              className="group relative bg-white/[0.02] border border-white/5 p-4 rounded-2xl hover:bg-white/[0.05] transition-all overflow-hidden"
            >
              {/* Status Bar Indicator */}
              <div className={cn(
                "absolute left-0 top-0 bottom-0 w-1",
                exec.status === 'completed' ? "bg-emerald-500" : 
                exec.status === 'running' ? "bg-primary animate-pulse" : "bg-amber-500"
              )} />

              <div className="flex justify-between items-start ml-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{exec.squadName}</span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground truncate max-w-[100px]">{exec.projectName}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 font-mono uppercase tracking-widest">
                    ID: {exec.id.slice(0, 8)}...
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-black text-primary">
                    {exec.totalTokens > 0 ? `${(exec.totalTokens / 1000).toFixed(1)}k tokens` : '--'}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {new Date(exec.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 border border-dashed border-white/10 rounded-3xl text-center">
            <History className="w-8 h-8 text-white/10 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground italic">
              Aguardando primeira execução...
            </p>
          </div>
        )}
      </div>

      {/* Mini Cost Real-time Tracker */}
      {data?.stats && (
        <div className="mt-6 p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Custo Acumulado</span>
          </div>
          <span className="text-lg font-black text-primary">
            ${data.stats.totalCost.toFixed(4)}
          </span>
        </div>
      )}
    </div>
  );
}

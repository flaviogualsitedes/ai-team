import React from 'react';
import Link from 'next/link';
import { 
  Users, 
  Plus, 
  ArrowRight, 
  LayoutGrid, 
  Search,
  Settings2,
  Calendar,
  Box,
  BrainCircuit
} from "lucide-react";
import { getSquads } from '@/lib/db';
import { cn } from '@/lib/utils';

export const dynamic = "force-dynamic";

export default async function SquadsPage() {
  const squads = await getSquads();

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-secondary/20 p-8 rounded-3xl border border-white/5 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Users className="w-32 h-32 text-primary" />
        </div>
        
        <div className="relative z-10">
          <h1 className="text-4xl font-black tracking-tight mb-2">
            Gestão de <span className="text-primary">Squads</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl">
            Recrute agentes especialistas e monte times de alta performance para seus projetos.
          </p>
        </div>

        <button className="relative z-10 flex items-center gap-2 bg-primary text-primary-foreground px-6 py-4 rounded-2xl font-bold hover:scale-105 transition-all shadow-[0_0_20px_rgba(var(--primary),0.3)] group">
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          Nova Squad
        </button>
      </div>

      {/* Filters & Tools */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-secondary/40 p-1.5 rounded-xl border border-white/5">
          <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            Todas
          </button>
          <button className="px-4 py-2 rounded-lg hover:bg-white/5 text-muted-foreground font-bold text-sm transition-colors">
            Ativas
          </button>
          <button className="px-4 py-2 rounded-lg hover:bg-white/5 text-muted-foreground font-bold text-sm transition-colors">
            Arquivadas
          </button>
        </div>

        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Buscar squads por nome ou função..."
            className="w-full bg-secondary/30 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-all backdrop-blur-md"
          />
        </div>
      </div>

      {/* Squads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {squads.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center bg-secondary/10 rounded-3xl border-2 border-dashed border-white/5">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Nenhuma squad encontrada</h3>
            <p className="text-muted-foreground mb-6">Comece criando sua primeira squad de inteligência.</p>
            <button className="bg-white/10 hover:bg-white/15 px-6 py-3 rounded-xl font-bold transition-all">
              Criar Primeira Squad
            </button>
          </div>
        ) : (
          squads.map((squad) => (
            <div 
              key={squad.id} 
              className="group bg-secondary/20 hover:bg-secondary/30 rounded-3xl border border-white/5 p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden"
            >
              {/* Card Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <Link 
                  href={`/squads/${squad.id}`}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all"
                >
                  <Settings2 className="w-5 h-5" />
                </Link>
              </div>

              {/* Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{squad.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1 min-h-[40px]">
                    {squad.description || "Nenhuma descrição fornecida."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-tighter text-muted-foreground font-bold">Membros</span>
                    <div className="flex items-center gap-1.5 text-foreground font-bold">
                      <Users className="w-3.5 h-3.5 text-sky-400" />
                      {squad.memberCount} Ativos
                    </div>
                  </div>
                  <div className="space-y-1 text-right">
                    <span className="text-[10px] uppercase tracking-tighter text-muted-foreground font-bold">Pipeline</span>
                    <div className="flex items-center justify-end gap-1.5 text-foreground font-bold capitalize">
                      <Box className="w-3.5 h-3.5 text-amber-400" />
                      {squad.pipeline}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="mt-6 pt-6 border-t border-white/5">
                <Link 
                  href={`/squads/${squad.id}`}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-primary hover:text-primary-foreground transition-all font-bold group/btn"
                >
                  Gerenciar Squad
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

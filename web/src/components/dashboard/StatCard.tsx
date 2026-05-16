import React from 'react';
import { LucideIcon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isUp: boolean;
  };
  color?: 'cyan' | 'blue' | 'emerald' | 'amber';
}

const colorMap = {
  cyan: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
  blue: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  emerald: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  amber: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
};

export function StatCard({ label, value, icon: Icon, trend, color = 'cyan' }: StatCardProps) {
  return (
    <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center border",
          colorMap[color]
        )}>
          <Icon className="w-6 h-6" />
        </div>
        
        {trend && (
          <div className={cn(
            "text-xs font-bold px-2 py-1 rounded-full border",
            trend.isUp ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" : "text-amber-400 bg-amber-400/10 border-amber-400/20"
          )}>
            {trend.isUp ? '+' : ''}{trend.value}
          </div>
        )}
      </div>

      <div>
        <div className="text-sm font-medium text-muted-foreground mb-1">{label}</div>
        <div className="text-3xl font-bold tracking-tight text-foreground">{value}</div>
      </div>
    </div>
  );
}

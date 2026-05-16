'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  UserRound,
  Layers, 
  Terminal, 
  Settings,
  Shield,
  Zap,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: UserRound, label: 'Agentes', href: '/agents' },
  { icon: Users, label: 'Squads', href: '/squads' },
  { icon: Activity, label: 'Execuções', href: '/executions' },
  { icon: Settings, label: 'Configurações', href: '/settings' },
];

const secondaryItems = [
  { icon: Shield, label: 'Vault', href: '/vault' },
  { icon: Settings, label: 'Configurações', href: '/settings' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen glass-panel border-r border-border/50 flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
          <Zap className="w-6 h-6 text-primary" fill="currentColor" />
        </div>
        <h1 className="font-bold text-xl tracking-tight text-foreground">
          AI<span className="text-primary">Team</span>
        </h1>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-4">
          Menu Principal
        </div>
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
              pathname === item.href 
                ? "bg-primary/10 text-primary border border-primary/20" 
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            )}
          >
            <item.icon className={cn(
              "w-5 h-5",
              pathname === item.href ? "text-primary" : "group-hover:text-primary transition-colors"
            )} />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}

        <div className="pt-8 text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-4">
          Sistema
        </div>
        {secondaryItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
              pathname === item.href 
                ? "bg-primary/10 text-primary border border-primary/20" 
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            )}
          >
            <item.icon className="w-5 h-5 group-hover:text-primary transition-colors" />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-border/50">
        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
          <div className="text-xs text-muted-foreground mb-1 italic">CLI Version</div>
          <div className="text-sm font-mono text-primary font-bold">v0.1.0-beta</div>
        </div>
      </div>
    </aside>
  );
}

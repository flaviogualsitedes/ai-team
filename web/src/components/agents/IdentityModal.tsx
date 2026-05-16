'use client';

import { useState, useEffect } from 'react';
import { X, Fingerprint, Copy, Check, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IdentityModalProps {
  agentName: string;
  personality: string;
  isOpen: boolean;
  onClose: () => void;
}

export function IdentityModal({ agentName, personality, isOpen, onClose }: IdentityModalProps) {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(personality);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Fingerprint className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-lg uppercase tracking-tighter">Identidade Digital</h3>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-50">{agentName}</p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/5 text-muted-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-primary/60">
              <Terminal className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">System Prompt (XML Core)</span>
            </div>
            
            <button 
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest transition-all"
            >
              {copied ? (
                <><Check className="w-3.5 h-3.5 text-emerald-400" /> Copiado</>
              ) : (
                <><Copy className="w-3.5 h-3.5" /> Copiar XML</>
              )}
            </button>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-primary/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <pre className="relative bg-black/50 border border-white/5 rounded-2xl p-6 overflow-x-auto max-h-[400px] scrollbar-thin scrollbar-thumb-white/10">
              <code className="text-[13px] font-mono leading-relaxed text-blue-300/90 whitespace-pre-wrap">
                {personality || '<!-- Nenhuma diretriz customizada carregada para este agente -->'}
              </code>
            </pre>
          </div>
          
          <div className="mt-6 flex gap-4">
            <div className="flex-1 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] block mb-2">Protocolo de Segurança</span>
              <p className="text-[11px] text-muted-foreground leading-snug">
                As diretrizes acima são imutáveis durante a sessão e garantem o isolamento ético do agente.
              </p>
            </div>
            <div className="flex-1 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] block mb-2">Motor de Decisão</span>
              <p className="text-[11px] text-muted-foreground leading-snug">
                Baseado nos padrões Anthropic XML para máxima aderência às regras do squad.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Decoration */}
        <div className="h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </div>
    </div>
  );
}

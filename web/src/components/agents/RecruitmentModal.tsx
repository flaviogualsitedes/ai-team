'use client';

import { useChat } from '@ai-sdk/react';
import { 
  X, 
  Send, 
  Bot, 
  User, 
  Terminal, 
  Loader2, 
  Plus,
  Command,
  Brain,
  Sparkles,
  FileCode,
  Zap,
  Save,
  RefreshCcw
} from 'lucide-react';
import { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface RecruitmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RecruitmentModal({ isOpen, onClose }: RecruitmentModalProps) {
  const [draftSpec, setDraftSpec] = useState<string>('<!-- O Magnus Mastermind está preparando a forja... -->');
  const [isSwapped, setIsSwapped] = useState(false);
  const hasStarted = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, append, setMessages, reload } = useChat({
    api: '/api/chat',
    maxSteps: 5,
    onError: (err) => {
      console.error("Erro no Chat Magnus:", err);
      hasStarted.current = false;
    }
  });

  // Sincroniza o Spec Forge com as Tool Calls do Magnus
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.toolInvocations) {
      for (const invocation of lastMessage.toolInvocations) {
        if (invocation.toolName === 'updateDraftSpec') {
          const { spec } = invocation.args as { spec: string };
          if (spec) setDraftSpec(spec);
        }
      }
    }
  }, [messages]);

  // Função para iniciar ou reiniciar o recrutamento
  const startRecruitment = async () => {
    try {
      hasStarted.current = true;
      if (typeof append === 'function') {
        await append({
          role: 'user',
          content: "Magnus, ative o protocolo de recrutamento alpha agora. Já preencha um template básico de identidade no Spec Forge e me faça a primeira pergunta para começarmos a trilha de criação do novo agente."
        });
      } else {
        console.error("Hook append não disponível no momento.");
        hasStarted.current = false;
      }
    } catch (e) {
      console.error("Erro ao disparar append:", e);
      hasStarted.current = false;
    }
  };


  // Iniciação Proativa do Magnus
  useEffect(() => {
    if (isOpen && !hasStarted.current && messages.length === 0 && !isLoading) {
      const timer = setTimeout(() => {
        startRecruitment();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isOpen, messages.length, isLoading]);

  // Reset ao fechar
  useEffect(() => {
    if (!isOpen) {
      hasStarted.current = false;
      if (messages.length > 0) setMessages([]);
    }
  }, [isOpen, messages.length, setMessages]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    append({
      role: 'user',
      content: "Magnus, o rascunho está perfeito. Pode efetivar o recrutamento deste agente agora com base nessas especificações."
    });
  };

  const handleSyncBack = (e: React.MouseEvent) => {
    e.preventDefault();
    append({
      role: 'user',
      content: `Magnus, eu fiz algumas edições manuais no Spec Forge. Por favor, analise e considere estas novas diretrizes para o agente:\n\n${draftSpec}`
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-8" onClick={(e) => e.stopPropagation()}>
      <div 
        className="absolute inset-0 bg-black/95 backdrop-blur-3xl animate-in fade-in duration-700"
        onClick={onClose}
      />
      
      <div 
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "relative w-full max-w-[95vw] h-[92vh] bg-[#020202] border border-white/10 rounded-[3rem] shadow-[0_0_150px_rgba(var(--primary),0.2)] overflow-hidden flex animate-in zoom-in-95 duration-500",
          isSwapped ? "flex-row-reverse" : "flex-row"
        )}
      >
        
        {/* SPEC FORGE */}
        <div className="flex-[1.2] flex flex-col bg-black/40 relative group/forge border-r border-white/5">
          <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <FileCode className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-black text-xl uppercase tracking-tighter italic text-white">Spec Forge</h3>
                <p className="text-[10px] text-emerald-500/40 uppercase tracking-widest font-black">Identity Matrix</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
               <button type="button" onClick={() => setIsSwapped(!isSwapped)} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-white/40 transition-all hover:text-primary">
                  <Sparkles className="w-5 h-5" />
               </button>
               <button type="button" onClick={handleSyncBack} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-[10px] font-black text-primary uppercase tracking-widest hover:bg-primary/20 transition-all">
                  <Zap className="w-4 h-4" /> Sync Manual
               </button>
            </div>
          </div>

          <div className="flex-1 p-8 overflow-hidden flex flex-col bg-gradient-to-br from-transparent to-primary/5">
            <div className="flex-1 bg-[#050505] border border-white/10 rounded-[2rem] p-8 relative overflow-hidden group/code shadow-2xl">
               <textarea 
                  value={draftSpec}
                  onChange={(e) => setDraftSpec(e.target.value)}
                  className="w-full h-full bg-transparent border-none focus:ring-0 text-sm font-mono text-emerald-400/80 leading-relaxed resize-none scrollbar-thin scrollbar-thumb-white/10"
                  spellCheck={false}
               />
               <div className="absolute bottom-6 left-8 right-8 flex justify-between items-center pointer-events-none opacity-40">
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500/50">Elite Protocol Alpha</span>
                  <div className="flex items-center gap-2 animate-pulse">
                     <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Live Forge</span>
                  </div>
               </div>
            </div>

            <div className="mt-8">
               <button 
                  type="button"
                  onClick={handleSave}
                  disabled={isLoading}
                  className="w-full bg-emerald-500 text-black hover:bg-emerald-400 py-6 rounded-[1.8rem] text-[13px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 group/save shadow-[0_20px_50px_rgba(16,185,129,0.3)] disabled:opacity-20"
                >
                  <Save className="w-6 h-6 group-hover/save:scale-110 transition-transform" />
                  Efetivar Recrutamento
               </button>
            </div>
          </div>
        </div>

        {/* COMMAND CHAT */}
        <div className="flex-1 flex flex-col bg-[#030303]">
          <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_30px_rgba(var(--primary),0.2)]">
                <Brain className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-black text-xl uppercase tracking-tighter italic text-white">Command Chat</h3>
                <p className="text-[10px] text-primary/40 uppercase tracking-widest font-black">Magnus Orchestrator</p>
              </div>
            </div>
            <button type="button" onClick={onClose} className="p-3 rounded-2xl hover:bg-white/5 text-muted-foreground transition-all hover:rotate-90">
               <X className="w-6 h-6" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin scrollbar-thumb-white/10">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center space-y-6">
                <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center relative overflow-hidden group/init">
                   <div className={cn("absolute inset-0 bg-primary/10 transition-all duration-1000", isLoading ? "animate-pulse" : "scale-0")} />
                   <Brain className={cn("w-10 h-10 transition-all duration-500", isLoading ? "text-primary scale-110 animate-pulse" : "text-white/20")} />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">
                    {isLoading ? "Invocando Magnus Mastermind..." : "Aguardando Inicialização"}
                  </p>
                  {!isLoading && (
                    <button 
                      onClick={startRecruitment}
                      className="text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-primary flex items-center gap-2 mx-auto transition-colors"
                    >
                      <RefreshCcw className="w-3 h-3" /> Clique para iniciar manualmente
                    </button>
                  )}
                </div>
              </div>
            )}
            
            {messages.map((m) => (
              <div key={m.id} className={cn("flex gap-5 max-w-[90%]", m.role === 'user' ? "ml-auto flex-row-reverse text-right" : "mr-auto")}>
                <div className={cn("w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center border transition-all shadow-lg", m.role === 'user' ? "bg-white/5 border-white/10" : "bg-primary/20 border-primary/20 text-primary shadow-[0_0_20px_rgba(var(--primary),0.3)]")}>
                  {m.role === 'user' ? <User className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
                </div>
                <div className="space-y-2">
                  <div className={cn("px-6 py-4 rounded-[1.5rem] text-[14px] leading-relaxed shadow-xl border", m.role === 'user' ? "bg-primary border-primary/20 text-primary-foreground font-medium rounded-tr-none" : "bg-white/5 border-white/5 text-foreground rounded-tl-none")}>
                    {m.content}
                    {m.toolInvocations?.map((ti) => (
                      <div key={ti.toolCallId} className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500/60 italic">
                        <Zap className="w-3 h-3 text-emerald-500" /> Forge Sync Active
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && messages[messages.length-1]?.role === 'user' && (
               <div className="flex gap-5 mr-auto">
                  <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_20px_rgba(var(--primary),0.2)]"><Bot className="w-6 h-6" /></div>
                  <div className="bg-white/5 px-6 py-4 rounded-[1.5rem] border border-white/5 rounded-tl-none"><Loader2 className="w-5 h-5 animate-spin opacity-30" /></div>
               </div>
            )}
          </div>

          <div className="p-10 border-t border-white/5 bg-black/60 backdrop-blur-xl">
            <form onSubmit={handleSubmit} className="relative group">
              <input 
                value={input || ''} 
                onChange={handleInputChange} 
                placeholder="Dê suas diretrizes ao Magnus..." 
                className="w-full bg-white/5 border border-white/10 rounded-3xl py-6 px-8 pr-20 focus:outline-none focus:border-primary/50 transition-all text-[15px] shadow-2xl group-hover:border-white/20 placeholder:text-white/10" 
              />
              <button 
                type="submit" 
                disabled={isLoading || !(input || '').trim()} 
                className="absolute right-3 top-3 bottom-3 w-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-20 disabled:scale-100 transition-all shadow-[0_0_20px_rgba(var(--primary),0.4)]"
              >
                <Send className="w-6 h-6" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useChat } from '@ai-sdk/react';
import { 
  Send, 
  Bot, 
  User, 
  Terminal, 
  Sparkles,
  Command,
  Loader2,
  Trash2,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function ChatContent() {
  const searchParams = useSearchParams();
  const intent = searchParams.get('intent');
  const hasAutoPrompted = useRef(false);

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages, append } = useChat({
    api: '/api/chat',
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Lógica de Auto-Prompt para Recrutamento
  useEffect(() => {
    if (intent === 'recruit' && !hasAutoPrompted.current && messages.length === 0 && !isLoading) {
      hasAutoPrompted.current = true;
      append({
        role: 'user',
        content: "Magnus Mastermind, solicito o recrutamento de um novo Agente de Elite. Por favor, inicie o protocolo de avaliação para identificarmos o perfil necessário para o squad."
      });
    }
  }, [intent, messages.length, isLoading, append]);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(var(--primary),0.2)]">
            <Command className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">Command Center</h1>
            <p className="text-muted-foreground font-medium italic text-sm">Interface direta com o Arquiteto Alpha.</p>
          </div>
        </div>
        
        <button 
          onClick={() => setMessages([])}
          className="p-2.5 rounded-xl bg-white/5 hover:bg-red-500/10 hover:text-red-500 transition-all border border-white/5"
          title="Limpar Conversa"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* CHAT CONTAINER */}
      <div className="flex-1 min-h-0 bg-secondary/10 border border-white/5 rounded-[2.5rem] flex flex-col overflow-hidden relative shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
        {/* MESSAGES AREA */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-thin scrollbar-thumb-white/10"
        >
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="max-w-sm">
                <p className="font-black uppercase tracking-widest text-[10px] mb-2">Sistemas Online</p>
                <p className="text-sm italic">"Aguardando diretrizes para orquestração da Elite Squad. Como posso auxiliar no recrutamento ou gestão hoje?"</p>
              </div>
            </div>
          )}

          {messages.map((m) => (
            <div 
              key={m.id} 
              className={cn(
                "flex gap-4 max-w-[85%]",
                m.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl shrink-0 flex items-center justify-center border",
                m.role === 'user' 
                  ? "bg-white/5 border-white/10" 
                  : "bg-primary/20 border-primary/20 text-primary"
              )}>
                {m.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              
              <div className="space-y-2">
                <div className={cn(
                  "px-5 py-3.5 rounded-2xl text-sm leading-relaxed",
                  m.role === 'user'
                    ? "bg-primary text-primary-foreground font-medium rounded-tr-none"
                    : "bg-white/5 text-foreground border border-white/5 rounded-tl-none"
                )}>
                  {m.content}
                </div>
                
                {/* TOOL CALLS VISUALIZER */}
                {m.toolInvocations?.map((toolInvocation) => (
                   <div key={toolInvocation.toolCallId} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 border border-white/5 text-[10px] font-mono text-primary/60 uppercase tracking-tighter">
                      <Terminal className="w-3 h-3" />
                      <span>Executando: {toolInvocation.toolName}</span>
                      {'result' in toolInvocation && <span className="text-emerald-500/60 ml-auto">Concluído</span>}
                   </div>
                ))}
              </div>
            </div>
          ))}
          
          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex gap-4 mr-auto">
              <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/20 flex items-center justify-center text-primary animate-pulse">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-white/5 px-5 py-3.5 rounded-2xl border border-white/5 rounded-tl-none">
                <Loader2 className="w-4 h-4 animate-spin opacity-50" />
              </div>
            </div>
          )}
        </div>

        {/* INPUT AREA */}
        <div className="p-6 bg-black/20 border-t border-white/5">
          <form onSubmit={handleSubmit} className="relative group">
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Digite um comando para o Arquiteto Alpha..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 pr-14 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all placeholder:text-white/20 font-medium"
            />
            <button 
              type="submit"
              disabled={isLoading || !input?.trim()}
              className="absolute right-2 top-2 bottom-2 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-all disabled:opacity-20 disabled:grayscale"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </form>
          <div className="mt-3 flex gap-4 px-2">
            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest flex items-center gap-1">
              <Terminal className="w-2.5 h-2.5" /> Direct Database Access
            </span>
            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest flex items-center gap-1">
              <Plus className="w-2.5 h-2.5" /> Agent Recruitment Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}

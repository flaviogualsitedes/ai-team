'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Key } from "lucide-react";
import { cn } from '@/lib/utils';

interface ApiKeyInputProps {
  name: string;
  placeholder: string;
  defaultValue?: string;
  hasKey?: boolean;
}

export function ApiKeyInput({ name, placeholder, hasKey, defaultValue }: ApiKeyInputProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative group">
      <input 
        name={name}
        type={show ? "text" : "password"}
        defaultValue={defaultValue}
        placeholder={hasKey ? "••••••••••••••••••••••••••••••" : placeholder}
        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-white/20 transition-all pr-12 font-mono"
      />
      <button 
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-white/5 text-white/10 group-focus-within:text-white/30 hover:text-white/50 transition-all"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Bot, Save } from "lucide-react";
import { ModelConfig } from '../../../../src/llm/models';
import { updateGlobalSettingsAction } from './actions';

interface PreferencesFormProps {
  activeModelsList: ModelConfig[];
  activeProvidersList: any[];
  initialSettings: Record<string, string>;
}

export function PreferencesForm({ activeModelsList, activeProvidersList, initialSettings }: PreferencesFormProps) {
  const [selectedProvider, setSelectedProvider] = useState(initialSettings.default_provider || '');
  const [selectedModel, setSelectedModel] = useState(initialSettings.default_model || '');

  // Sincroniza o estado interno se as props (vindas do banco) mudarem
  useEffect(() => {
    if (initialSettings.default_provider) setSelectedProvider(initialSettings.default_provider);
    if (initialSettings.default_model) setSelectedModel(initialSettings.default_model);
  }, [initialSettings.default_provider, initialSettings.default_model]);

  const filteredModels = useMemo(() => {
    return activeModelsList.filter(m => m.provider === selectedProvider);
  }, [selectedProvider, activeModelsList]);

  // Garante que o modelo selecionado existe no provedor atual
  useEffect(() => {
    const modelExists = filteredModels.some(m => m.id === selectedModel);
    if (!modelExists && filteredModels.length > 0) {
      setSelectedModel(filteredModels[0].id);
    }
  }, [selectedProvider, filteredModels, selectedModel]);

  return (
    <form action={updateGlobalSettingsAction} className="space-y-6">
      <div className="space-y-2">
        <label className="text-xs font-bold text-muted-foreground ml-1">Provedor Principal</label>
        <select 
          name="default_provider"
          value={selectedProvider}
          onChange={(e) => setSelectedProvider(e.target.value)}
          disabled={activeProvidersList.length === 0}
          className="w-full bg-black/20 border border-white/5 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-all appearance-none disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {activeProvidersList.length > 0 ? (
            activeProvidersList.map(p => (
              <option key={p.id} value={p.id} className="bg-background">{p.name}</option>
            ))
          ) : (
            <option value="">Nenhum provedor ativo</option>
          )}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-muted-foreground ml-1">Modelo Padrão ({selectedProvider})</label>
        <select 
          name="default_model"
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          disabled={filteredModels.length === 0}
          className="w-full bg-black/20 border border-white/5 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-all appearance-none disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {filteredModels.length > 0 ? (
            filteredModels.map(m => (
              <option key={m.id} value={m.id} className="bg-background">{m.name}</option>
            ))
          ) : (
            <option value="">Nenhum modelo disponível</option>
          )}
        </select>
      </div>

      <button 
        type="submit"
        disabled={activeProvidersList.length === 0}
        className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-[0_0_20px_rgba(var(--primary),0.3)] disabled:opacity-50 disabled:grayscale"
      >
        <Save className="w-4 h-4" />
        Salvar Definições
      </button>
    </form>
  );
}

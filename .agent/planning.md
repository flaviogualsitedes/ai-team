# Roadmap AITeam

## Fase 1: Scaffolding & CLI Core (CONCLUÍDO ✅)
- [x] Configuração inicial (TS, tsup, Vitest)
- [x] Schema SQLite (Tabelas base: agents, squads, projects, executions)
- [x] Sistema i18n (pt-BR, en)
- [x] Comando `aiteam init` (Wizard de projeto)
- [x] Comando `aiteam config` (API Keys & Vault)
- [x] Comando `aiteam agent` (CRUD de agentes)
- [x] Comando `aiteam squad` (Pipeline de agentes)
- [x] Comando `aiteam logs` (Visualização de execuções)
- [x] Orquestrador Base (Execução sequencial)

## Fase 2: Motor de Execução & IA (CONCLUÍDO ✅)
- [x] Integração com Vercel AI SDK (Google Gemini/OpenAI).
- [x] Sistema de Vault Seguro (AES-256-GCM para chaves).
- [x] TruthResolver (Injeção de contexto inteligente).
- [x] Comando `run` interativo com suporte a `--task`.
- [x] Histórico de execuções com logs de tokens e duração.
- **Marco:** Primeira execução real com colaboração entre agentes validada.

## Fase 3: Memória & Dashboard (EM ANDAMENTO 🚧)
- [ ] **Memória de Longo Prazo:** Sistema de persistência de contexto entre execuções.
- [ ] **Dashboard Web:** Interface visual com Next.js para monitorar o Squad.
- [ ] **Análise de Custos:** Gráficos de consumo de tokens e economia.
- [ ] **Editor Visual:** Interface para montar Squads arrastando componentes.

## Fase 4: Avançado & Marketplace
- [ ] Modo Debate & Review (Agentes revisam uns aos outros).
- [ ] Skills Dinâmicas (Membros executam ferramentas externas/scripts).
- [ ] Marketplace de Squads & Agentes pré-configurados.
- [ ] Gamificação (Níveis e skins para agentes).

## Fase 5: SaaS & Escala
- [ ] Multi-tenant Cloud.
- [ ] Monitoramento Global de Performance.
- [ ] Integração com Slack/Discord/WhatsApp.

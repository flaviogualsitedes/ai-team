# AITeam — Histórico de Planejamento

**Consolidação** de todas as iterações de planejamento (v1 a v7).
Referência interna — o documento oficial é o [PRD](./prd.md).

---

## Origem do Projeto

O AITeam foi inspirado por frameworks open source de orquestração multi-agente
existentes no mercado. A partir de uma análise dos pontos fortes e limitações
dessas ferramentas, definimos uma arquitetura própria que prioriza:

- Instalação global via npm (não depende de clone de repo)
- Banco de dados persistente (não apenas arquivos YAML/MD)
- Isolamento entre projetos com memória cross-project inteligente
- Integração nativa com IDEs modernas
- Painel web local com terminal e file explorer

## Iterações de Planejamento

| Versão | Data | Features Adicionadas |
|--------|------|---------------------|
| v1 | 2026-05-16 | Fundação: CLI, SQLite, Gemini, 3 tools, orquestrador |
| v2 | 2026-05-16 | Integração com 9 IDEs, i18n (PT-BR, EN, ES) |
| v3 | 2026-05-16 | 8 modelos de IA, open source, config/reconfig, empresa, personalidade |
| v4 | 2026-05-16 | Terminal (xterm.js), File Explorer, isolamento por path |
| v5 | 2026-05-16 | Visualização agentes, memória curta/longa, gamificação, vault |
| v6 | 2026-05-16 | Rules/guardrails, visual isométrico, logs detalhados, error logs |
| v7 | 2026-05-16 | Relações N:N, memória cross-project, fonte da verdade hierárquica |
| v7+ | 2026-05-16 | Agendamento, notificações, custos, marketplace, versionamento, dry-run |

## Decisões Arquiteturais Chave

1. **TypeScript sobre JavaScript** — robustez, autocompletion, menos bugs
2. **SQLite sobre PostgreSQL** — zero config, portabilidade, funciona offline
3. **Vercel AI SDK sobre chamadas diretas** — multi-provider, streaming, tools
4. **Agentes globais com N:N** — reutilização entre projetos sem duplicação
5. **Memória abstrata cross-project** — aprendizado sem vazamento de dados
6. **Vault criptografado** — segurança de credenciais sem dependências externas

---

*Os planos detalhados v1-v7 estão preservados nos artefatos da conversa original.*

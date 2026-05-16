# Project Map - AITeam 🗺️ (Versão Final Revisada)

Este documento é a fonte definitiva de contexto para o agente. Cada arquivo e diretório foi revisado individualmente.

## 📂 Raiz (Root)
- `aiteam.db`: Banco SQLite central (Fonte da Verdade).
- `package.json`: Gestão de dependências e scripts.
- `setup-desktop.ps1`: Automação de ambiente para Windows.
- `start-aiteam.bat`: Atalho de inicialização.

## 📂 src/ (Core Engine)
- `index.ts`: Entry point do CLI (Commander.js).
- **src/core/**:
    - `orchestrator.ts`: Coordena a execução de squads e pipeline de agentes.
    - `truth-resolver.ts`: Resolve contexto hierárquico (System Prompts, Modelos, Keys).
    - `vault.ts`: Criptografia AES-256-GCM para chaves sensíveis.
- **src/db/**:
    - `schema.ts`: Definição de tabelas (agentes, squads, projetos, memórias, vault, etc).
    - `index.ts`: Driver better-sqlite3 e inicialização.
    - `seed.ts`: Dados iniciais para novos ambientes.
- **src/llm/**:
    - `models.ts`: Catálogo técnico de modelos (Google, OpenAI, Groq, Anthropic) com métricas de custo.
- **src/cli/**: Implementação de comandos (`init`, `config`, `run`, `agent`, `squad`, `status`, `logs`, `debug`).
- **src/skills/**: Ferramentas dos agentes (`file-system.ts`, etc).
- **src/templates/**: Padrões de prompts e localização (`locales/`).

## 📂 web/ (Dashboard SaaS)
- **web/src/app/**:
    - `api/chat/route.ts`: Orquestrador Magnus (Dinâmico + Vault).
    - `api/system/update/route.ts`: Self-update via Git Pull.
    - `agents/page.tsx`: Lógica de Leveling (Volume + Performance DNA).
    - `chat/page.tsx`: Command Center principal.
- **web/src/components/**:
    - `agents/`: `RecruitmentModal.tsx` (Forge), `AgentListClient.tsx` (Grid), `IdentityModal.tsx` (DNA).
    - `layout/`: `Sidebar.tsx` (Navegação).
- **web/src/lib/**: Utilitários de DB e Tailwind.

---

## 🏛️ Protocolo de Memória (Rules)
Sempre consultar `.agent/rules.md` e `.agent/context_log.md` antes de cada resposta.
A cada `;` modificado, o contexto deve ser preservado.

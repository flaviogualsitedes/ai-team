# AITeam — Product Requirements Document (PRD)

**Versão:** 1.0
**Data:** 2026-05-16
**Status:** Aprovado para desenvolvimento

---

## 1. Visão do Produto

**AITeam** é um framework de orquestração multi-agente instalável globalmente via npm, que permite criar, configurar e executar equipes de agentes de IA colaborativos com memória persistente, isolamento por projeto e integração nativa com IDEs modernas.

### Missão
Democratizar o uso de agentes de IA orquestrados, oferecendo uma ferramenta open source, extensível e gratuita que qualquer desenvolvedor pode instalar e usar imediatamente.

### Diferencial
- **Instalação global** (`npm install -g aiteam`) — funciona em qualquer projeto
- **Multi-modelo** — suporta 8+ modelos (Gemini, Claude, GPT, Ollama)
- **Isolamento inteligente** — dados de projetos separados, mas agentes compartilham aprendizados abstratos
- **Integração com 9 IDEs** — configura automaticamente Antigravity, Claude Code, Cursor, VS Code, etc.
- **Painel web local** — dashboard com terminal, file explorer e visualização em tempo real
- **Open source** com modelo de doações

---

## 2. Personas de Usuário

| Persona | Descrição | Necessidade principal |
|---------|-----------|----------------------|
| **Dev Solo** | Desenvolvedor que trabalha sozinho em vários projetos | Automação de tarefas repetitivas com IA |
| **Tech Lead** | Líder técnico de equipe pequena | Padronização de workflows de IA entre projetos |
| **Creator** | Criador de conteúdo digital | Automação de pesquisa, redação e revisão |
| **Empreendedor** | Dono de PME com pouco time técnico | IA que executa tarefas sem precisar programar |

---

## 3. Features por Fase

### Fase 1 — Fundação (MVP)

| ID | Feature | Prioridade |
|----|---------|------------|
| F01 | CLI global com commander + inquirer | MUST |
| F02 | Banco SQLite com schema completo (todas as tabelas) | MUST |
| F03 | Sistema i18n (PT-BR, EN, ES) | MUST |
| F04 | Templates para 9 IDEs | MUST |
| F05 | Catálogo de 8 modelos de IA | MUST |
| F06 | `aiteam init` — wizard completo (idioma, IDEs, modelo, nome) | MUST |
| F07 | `aiteam config` — show, set, reconfigure, keys, reset | MUST |
| F08 | `aiteam company` — setup, edit, show | MUST |
| F09 | `aiteam agent` — create, list, show, edit, personality, delete, models | MUST |
| F10 | `aiteam squad` — create, list, show, edit, delete | MUST |
| F11 | `aiteam run` — execução com pipeline sequencial + checkpoints | MUST |
| F12 | 3 tools agênticas built-in (file_read, file_write, shell_exec) | MUST |
| F13 | Orquestrador de pipeline (sequencial) | MUST |
| F14 | Relações N:N (agentes↔squads↔projetos) | MUST |
| F15 | Fonte da verdade hierárquica (4 níveis) | MUST |
| F16 | Memória (schema de 3 camadas: pessoal, projeto, execução) | MUST |
| F17 | Rules e Guardrails (global e por projeto) | MUST |
| F18 | Cofre de credenciais (Vault) — AES-256-GCM | MUST |
| F19 | Biblioteca de conhecimento (CLI) | SHOULD |
| F20 | Logs detalhados (skills, uso, analytics) | SHOULD |
| F21 | Log de erros do sistema | SHOULD |
| F22 | Visualização texto (logs ricos no CLI) | SHOULD |
| F23 | Dry-run / teste de squad | SHOULD |
| F24 | Rastreamento de custos (tokens → USD) | COULD |
| F25 | Open source GitHub + FUNDING.yml | MUST |

### Fase 2 — Painel Web

| ID | Feature | Prioridade |
|----|---------|------------|
| F26 | Dashboard web (Fastify + React/Vite, localhost:4321) | MUST |
| F27 | Terminal integrado (xterm.js + node-pty) | MUST |
| F28 | File Explorer (react-arborist) | MUST |
| F29 | Visualização animada de interação dos agentes | SHOULD |
| F30 | Gamificação e avaliação (⭐ 1-5) | SHOULD |
| F31 | Biblioteca de exemplos (acertos/erros) + estilos | SHOULD |
| F32 | Heartbeat + real-time updates (WebSocket) | MUST |
| F33 | Biblioteca de conhecimento (painel visual) | SHOULD |
| F34 | Notificações (webhook, Discord, Slack, email) | COULD |
| F35 | Agendamento automático (cron) | COULD |
| F36 | Marketplace de templates (instalar squads/agentes pré-prontos) | COULD |

### Fase 3 — Inteligência

| ID | Feature | Prioridade |
|----|---------|------------|
| F37 | RAG com sqlite-vec (busca semântica na memória) | MUST |
| F38 | Memória cross-project com abstração inteligente | MUST |
| F39 | Auto-promoção de memória curta → longa | SHOULD |
| F40 | Visual isométrico com skins e packs | COULD |
| F41 | Upload de skins customizadas | COULD |
| F42 | Versionamento de agentes + rollback | SHOULD |

### Fase 4 — Tools Avançadas

| ID | Feature | Prioridade |
|----|---------|------------|
| F43 | Tool: web_search | MUST |
| F44 | Tool: http_request | MUST |
| F45 | Tool: email (Gmail/SMTP) | SHOULD |
| F46 | Tool: browser (Playwright) | SHOULD |
| F47 | MCP Client (conectar a servidores MCP externos) | COULD |
| F48 | Plugin system (tools de terceiros) | COULD |

### Fase 5 — Escala

| ID | Feature | Prioridade |
|----|---------|------------|
| F49 | Deploy remoto (Coolify, Docker) | COULD |
| F50 | Autenticação multi-usuário | COULD |
| F51 | Migração SQLite → PostgreSQL (opcional) | COULD |
| F52 | API REST pública | COULD |

---

## 4. Árvore de Comandos Completa

```
aiteam
├── init                              Inicializar projeto (wizard)
├── config
│   ├── show                          Ver toda configuração
│   ├── set <key> <value>             Alterar configuração
│   ├── set-key <provider> <key>      Configurar API key
│   ├── keys                          Listar API keys (mascaradas)
│   ├── reconfigure                   Re-executar wizard
│   ├── update-ides                   Atualizar templates de IDE
│   └── reset                         Resetar para padrões
├── company
│   ├── setup                         Configurar empresa (wizard)
│   ├── edit                          Editar company.md
│   └── show                          Mostrar contexto atual
├── agent
│   ├── create                        Criar agente (wizard)
│   ├── list                          Listar agentes
│   ├── show <nome>                   Detalhes de um agente
│   ├── edit <nome>                   Editar agente
│   ├── personality <nome>            Configurar personalidade
│   ├── delete <nome>                 Remover agente
│   ├── models                        Listar modelos disponíveis
│   ├── history <nome>                Ver versões (Fase 3)
│   └── rollback <nome> --to <v>      Restaurar versão (Fase 3)
├── squad
│   ├── create                        Criar squad (wizard)
│   ├── list                          Listar squads
│   ├── show <nome>                   Detalhes de um squad
│   ├── edit <nome>                   Editar squad
│   ├── assign <squad> --project <p>  Alocar squad em projeto
│   └── delete <nome>                 Remover squad
├── run <squad>                       Executar um squad
│   ├── --dry-run                     Preview sem executar
│   ├── --visual                      Abrir no painel com animação
│   └── --project <id>                Em qual projeto executar
├── rule
│   ├── add <texto>                   Adicionar regra
│   ├── list                          Listar regras
│   ├── disable <id>                  Desativar regra
│   └── delete <id>                   Remover regra
├── guardrail
│   ├── add <nome>                    Adicionar guardrail
│   ├── list                          Listar guardrails
│   └── delete <id>                   Remover guardrail
├── vault
│   ├── add <nome>                    Adicionar credencial
│   ├── list                          Listar (mascarado)
│   ├── get <nome>                    Ver credencial
│   ├── get <nome> --reveal           Ver valor real
│   └── delete <nome>                 Remover credencial
├── knowledge
│   ├── add                           Adicionar conhecimento
│   ├── list                          Listar por categoria
│   ├── search <query>                Buscar
│   └── import <file>                 Importar documento
├── memory
│   ├── list                          Listar memórias
│   ├── list --agent <nome>           Por agente
│   ├── clear --type short            Limpar curtas
│   └── promote <id>                  Promover curta → longa
├── style
│   ├── create <nome>                 Criar estilo
│   ├── list                          Listar estilos
│   └── apply <nome> --agent <ag>     Aplicar a um agente
├── logs                              Últimas execuções
│   ├── --squad <nome>                Por squad
│   ├── --agent <nome>                Por agente
│   └── skills                        Ranking de skills
├── errors                            Log de erros
│   ├── --unresolved                  Só não resolvidos
│   └── resolve <id>                  Marcar resolvido
├── schedule                          Agendamento (Fase 2)
│   ├── add <squad> --cron <expr>     Agendar
│   ├── list                          Listar agendamentos
│   └── delete <id>                   Remover
├── status                            Estado do projeto
├── panel                             Abrir painel web
├── update                            Atualizar AITeam
│   └── --check                       Só verificar versão
└── help                              Ajuda completa
```

---

## 5. Requisitos Não-Funcionais

| Requisito | Especificação |
|-----------|---------------|
| **Performance** | CLI responde em <500ms, execução inicia em <2s |
| **Segurança** | Vault com AES-256-GCM, sandbox de arquivos, sanitização de paths |
| **Compatibilidade** | Windows 10+, macOS 12+, Linux (Ubuntu 20+) |
| **Node.js** | v20+ LTS |
| **Instalação** | `npm install -g aiteam` — funciona imediatamente |
| **Offline** | Funciona sem internet (com Ollama) |
| **i18n** | PT-BR (padrão), EN, ES |
| **Acessibilidade** | CLI com cores desativáveis (--no-color) |
| **Tamanho** | Pacote npm < 5MB (sem contar dependências) |
| **Licença** | MIT |

---

## 6. Métricas de Sucesso

| Métrica | Meta (6 meses) |
|---------|----------------|
| GitHub Stars | 500+ |
| npm Downloads/mês | 1,000+ |
| Agentes criados (telemetria anônima opt-in) | 5,000+ |
| Contribuidores | 10+ |
| Issues resolvidas pela comunidade | 30%+ |

# Magnus Mastermind Orchestrator (Technical Spec)

O **Magnus Mastermind** é o agente orquestrador central da plataforma AITeam, responsável por guiar o usuário em tarefas complexas, começando pelo sistema de **Recrutamento de Elite**.

## 🏗️ Arquitetura de Rota Dinâmica
A rota de chat (`/web/src/app/api/chat/route.ts`) não possui um modelo fixo. Ela opera como um resolvedor dinâmico baseado no banco de dados.

### Fluxo de Decisão:
1. **Database Lookup:** Conecta ao `aiteam.db` na raiz do projeto.
2. **Settings Resolution:** Lê as chaves `default_provider` e `default_model` da tabela `settings`.
3. **Key Retrieval:** Busca a `api_key` na tabela `api_keys` correspondente ao provedor.
4. **Security Layer (Vault):** Descriptografa a chave em tempo real usando o algoritmo **AES-256-GCM** (mesma lógica do Core CLI).
5. **Provider Factory:** Instancia o provedor correto (Google, Groq, OpenAI ou Anthropic) injetando a chave e o baseURL (no caso do Groq).

## 🛠️ Tooling & Sincronização
O Magnus possui a ferramenta `updateDraftSpec` que permite atualizar a interface do usuário sem interromper o fluxo da conversa.

*   **Tool:** `updateDraftSpec`
*   **Ação:** Atualiza o estado `draftSpec` no componente `RecruitmentModal`.
*   **Protocolo:** O Magnus deve gerar blocos XML estruturados para que o Spec Forge seja uma representação viva da identidade do agente.

## 🛡️ Resiliência (Client-Side)
O componente `RecruitmentModal` implementa:
*   **Auto-Trigger:** Inicia a conversa proativamente se não houver mensagens.
*   **Manual Override:** Botão de emergência para forçar o início se o modelo demorar a responder (timeout visual).
*   **Event Shield:** `stopPropagation` em todos os cliques para evitar o fechamento acidental do modal (UX SaaS de alto nível).

## 📍 Localização dos Arquivos Chave
- **API Route:** `web/src/app/api/chat/route.ts`
- **Modal UI:** `web/src/components/agents/RecruitmentModal.tsx`
- **Core Truth:** `src/core/truth-resolver.ts`
- **Vault:** `src/core/vault.ts`

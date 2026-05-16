# Checklist do Agente (AITeam Protocol)

Sempre que concluir uma tarefa ou comando, eu DEVO:

1.  **Git Check:** Executar `git status` para verificar arquivos alterados.
2.  **Roadmap Update:** Atualizar o `.agent/planning.md` com o status real da tarefa.
3.  **Context Log:** Registrar a decisão técnica e o impacto no `.agent/context_log.md`.
4.  **Verification:** Validar se a mudança respeita o `TruthResolver` e as `specs/`.
5.  **Commit & Push:** Se uma funcionalidade for concluída ou estabilizada, realizar o commit e push imediatamente.

---

# Memória de Contexto

Sempre que eu for consultado, devo saber:
- **O que foi falado:** Histórico de conversas e intenções do usuário.
- **O que foi feito:** Arquivos criados, modificados e deletados.
- **O que estou fazendo:** A tarefa atual e seu progresso granular.
- **O que precisa ser feito:** Os próximos passos do roadmap.
- **Contexto de Linha:** Saber o "porquê" de cada `;` e função em arquivos específicos.

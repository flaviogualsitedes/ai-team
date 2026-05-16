# Sistema de Recrutamento de Elite (AITeam)

Este documento define o padrão para a criação e configuração de membros de squads, integrando as melhores práticas do **OpenSquad** (Arquitetura de Persona) e da **Anthropic** (Structured Prompting).

## 1. O "DNA" do Agente (Estrutura XML)

Todo System Prompt gerado deve seguir rigorosamente a estrutura de tags XML recomendada pela Anthropic para garantir que o modelo entenda a hierarquia das instruções.

```xml
<agent_identity>
  <name>{{NOME_MARVEL}}</name>
  <role>{{FUNCAO_DETALHADA}}</role>
  <backstory>{{HISTORIA_E_CONTEXTO}}</backstory>
</agent_identity>

<responsibilities>
  <primary_tasks>
    <!-- Lista de tarefas principais -->
  </primary_tasks>
  <boundary_rules>
    <!-- O que o agente NUNCA deve fazer (Anti-Patterns) -->
  </boundary_rules>
</responsibilities>

<communication_style>
  <tone>{{TONALIDADE}}</tone>
  <voice_guidance>
    <!-- Termos a usar vs Termos a evitar -->
  </voice_guidance>
</communication_style>

<quality_criteria>
  <!-- Critérios para o agente validar sua própria resposta -->
</quality_criteria>
```

## 2. Marvelizer (Geração de Nomes)

O sistema deve sugerir nomes baseados na regra de aliteração (Marvel Pattern).

| Função | Sugestão Marvel |
| :--- | :--- |
| Pesquisa | **Pietra Pixel** |
| Estratégia | **Steven Strategist** |
| Código | **Marcus Machinist** |
| Design | **Dexter Designer** |
| Redação | **Wanda Writer** |

## 3. Fluxo de Recrutamento (O Processo)

1. **Input:** O usuário descreve a necessidade em linguagem natural (ex: "Preciso de alguém para analisar meus e-mails").
2. **Magnus Analysis:** O orquestrador (Magnus Mastermind) analisa a tarefa.
3. **Draft de Persona:** Magnus gera o System Prompt usando o template XML acima.
4. **Naming:** Magnus aplica a regra Marvel para sugerir o nome.
5. **Aprovação:** O usuário revisa e "contrata" o agente para o squad.

## 4. Diferenciais Técnicos (Inspired by OpenSquad)

* **Anti-Patterns:** Definição explícita do que NÃO fazer evita alucinações comuns.
* **Context Isolation:** Cada agente recebe apenas o que é essencial para sua `role`.
* **Verification Loop:** O agente é instruído a revisar sua resposta contra os `quality_criteria` antes de entregar.

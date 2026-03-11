# 🤖 AI Orchestration Architecture

Este documento descreve a arquitetura de orquestração de IA do projeto Codai Voice, baseada em agentes especializados, skills modulares e regras de governança.

## 🏗️ Estrutura do Sistema

A inteligência do projeto está organizada no diretório `.cursor/` seguindo uma separação clara de responsabilidades:

```mermaid
graph TD
    User((Usuário)) -->|@workflow| Workflow[Workflow Agent]
    Workflow -->|Orquestra| Mike[Mike: Design]
    Workflow -->|Orquestra| Isa[Isa: Dev]
    Workflow -->|Orquestra| Buttowski[Buttowski: Review]
    Workflow -->|Orquestra| Hermione[Hermione: QA]
    Workflow -->|Orquestra| Harry[Harry: DX]

    subgraph Agents [Agentes Especializados]
        Mike
        Isa
        Buttowski
        Hermione
        Harry
    end

    subgraph Skills [Capacidades Técnicas]
        Arch[architecture-design]
        Task[task-breakdown]
        GH[github-pr]
        Sync[jira-sync]
        Test[testing-strategy]
    end

    subgraph Rules [Governança e Padrões]
        Code[code-standards]
        Policy[project-policies]
        Git[github-workflow]
        Jira[jira-workflow]
    end

    Mike --> Arch
    Mike --> Task
    Isa --> Code
    Isa --> Git
    Buttowski --> Code
    Buttowski --> GH
    Hermione --> Test
    Hermione --> Jira
```

## 👥 Agentes e Papéis

| Agente | Cargo | Responsabilidade Principal |
| :--- | :--- | :--- |
| **🔄 Workflow** | Maestro | Coordena a passagem de bastão entre os agentes e mantém o estado global. |
| **🏗️ Mike** | Principal Engineer | Define a arquitetura, toma decisões técnicas estratégicas e cria planos de ação. |
| **💻 Isa** | Full Stack Engineer | Transforma planos em código funcional, implementa features e abre Pull Requests. |
| **🧢 Buttowski** | Tech Lead | Garante a qualidade do código através de reviews rigorosos e validação de padrões. |
| **🧪 Hermione** | QA & Quality | Valida as entregas com testes automatizados (E2E/Integração) e cobertura. |
| **🪄 Harry** | Developer Advocate | Melhora a experiência do desenvolvedor (DX) e mantém a documentação impecável. |

## 🛠️ Skills (Capacidades)

As **Skills** são módulos de conhecimento técnico que os agentes acionam sob demanda. Elas não são aplicadas globalmente, o que mantém o contexto do modelo limpo e focado.

- `architecture-design`: Criação de ADRs e diagramas.
- `task-breakdown`: Divisão de requisitos em tarefas atômicas.
- `jira-sync`: Sincronização automática de status e comentários.
- `github-pr-review`: Interação direta com o GitHub para reviews.

## 📜 Rules (Governança)

As **Rules** definem os limites e padrões que todos os agentes devem seguir:

1. **Padrões de Código:** SOLID, Clean Code e obrigatoriedade de testes unitários.
2. **Políticas de Projeto:** Regras de versionamento (Semver) e gestão de mudanças pré-v1.
3. **Workflow de Integração:** Protocolos rígidos para branches, commits e transições no Jira.

## 🔄 Fluxo de Trabalho Típico

1. **Início:** O usuário invoca `@workflow [URL_JIRA]`.
2. **Design:** Mike cria o plano técnico e Buttowski o revisa.
3. **Dev:** Isa implementa o código e abre um PR.
4. **Review:** Buttowski realiza o Code Review no GitHub.
5. **QA:** Hermione executa os testes automatizados.
6. **DX:** Harry revisa a documentação e finaliza o processo.

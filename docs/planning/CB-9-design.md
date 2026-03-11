# Planejamento Técnico: CB-9 - Composição de Componentes (Multi-Step Assembly)

## 🎯 Visão Geral
Implementar a capacidade de compor interfaces complexas através de múltiplos comandos, mantendo o histórico do estado do layout e permitindo edições incrementais sem perda de contexto.

## 🏗️ Arquitetura da "Context Memory"

A memória de contexto será persistida no arquivo `.cursor/workflow-context.json` durante o desenvolvimento, mas para a aplicação em runtime, utilizaremos uma estrutura de **Sessão Estendida** no Redis.

### Estrutura no `workflow-context.json`:
```json
{
  "contextMemory": {
    "currentLayout": "string (JSX completo)",
    "history": [
      {
        "timestamp": "ISO-8601",
        "instruction": "string",
        "snapshot": "string (JSX)"
      }
    ],
    "components": [
      {
        "id": "string",
        "type": "string",
        "description": "string",
        "props": {}
      }
    ]
  }
}
```

### Estrutura no Redis (Runtime):
- `session:{id}:layout`: Armazena o JSX atual consolidado.
- `session:{id}:history`: Lista (LPUSH) dos últimos 10 comandos e snapshots.

## 🧠 Estratégia de "Diffs Inteligentes"

Para manipular o código JSX de forma incremental, adotaremos uma abordagem híbrida:

1.  **Context-Aware Prompting (Fase 1):** Enviar o `currentLayout` como contexto no `systemPrompt` para que o LLM realize a "mesclagem" natural.
2.  **Tag-Based Targeting (Fase 2):** Solicitar ao LLM que envolva novos componentes em tags identificáveis (ex: `<!-- ID: component-1 -->`) para permitir substituições cirúrgicas via Regex/String manipulation no backend.
3.  **AST Manipulation (Opcional/Futuro):** Se a complexidade aumentar, utilizaremos `babel/parser` e `babel/traverse` para inserções precisas em pontos específicos da árvore de componentes.

## 🛠️ Mudanças Necessárias

### 1. Backend (`src/app/api/generate/route.ts`)
- Alterar o `systemPrompt` para aceitar um parâmetro `context`.
- Recuperar o `currentLayout` do Redis antes de chamar a API da Groq.
- Implementar lógica de "Merge" se o comando for de edição/adição.

### 2. Frontend (`src/app/page.tsx`)
- Adicionar estado `isIncremental` para alternar entre "Novo" e "Adicionar ao atual".
- Exibir o histórico de comandos lateralmente para permitir "rollback" de passos específicos.

### 3. API de Versões (`src/app/api/versions/route.ts`)
- Expandir para retornar não apenas o código, mas a instrução que gerou aquela versão.

## 📝 Task Breakdown (Tarefas Atômicas)

### Fase 1: Infraestrutura de Memória
- [ ] **T1: Expansão do Schema de Contexto (0.5h)**
  - Atualizar `.cursor/workflow-context.json` com a nova estrutura de `contextMemory`.
  - **Critério de Aceite:** Arquivo validado com campos `currentLayout` e `history`.

- [ ] **T2: Persistência de Contexto no Redis (1h)**
  - Modificar `saveVersion` em `route.ts` para salvar também o `currentLayout` consolidado.
  - **Critério de Aceite:** Redis armazenando o estado atual da composição.

### Fase 2: Lógica de Composição
- [ ] **T3: Prompt de Contexto (1.5h)**
  - Refatorar `systemPrompt` para incluir o código atual e instruções de "diff".
  - **Critério de Aceite:** LLM recebendo o código anterior e conseguindo adicionar novos elementos sem deletar os antigos.

- [ ] **T4: Endpoint de Composição (1h)**
  - Criar/Ajustar endpoint para tratar comandos como "adicione", "remova" ou "edite".
  - **Critério de Aceite:** Sucesso em comandos incrementais via Postman/Curl.

### Fase 3: Interface e UX
- [ ] **T5: UI de Histórico Incremental (2h)**
  - Implementar visualização dos passos da composição no frontend.
  - **Critério de Aceite:** Usuário consegue ver a lista de alterações feitas.

- [ ] **T6: Preview Consolidado (1h)**
  - Garantir que o `PreviewSandbox` renderize sempre a última versão da composição.
  - **Critério de Aceite:** Preview refletindo todas as adições.

## 🏁 Conclusão do Design
O plano foca em simplicidade inicial via **Context-Aware Prompting**, garantindo que a Isa tenha o contexto necessário para realizar os "diffs" sem a sobrecarga de um parser de AST complexo nesta fase inicial.

**Aprovado por:** Mike (Principal Engineer) & Buttowski (Tech Lead)

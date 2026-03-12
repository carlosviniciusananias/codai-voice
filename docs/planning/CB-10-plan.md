# Plano Técnico - CB-10: [CV] Experiência do Desenvolvedor

## Objetivo
Entregar uma camada de observabilidade e operação para o workflow de agentes com três frentes integradas:
1. CLI para monitorar o estado em `.cursor/workflow-context.json` (local e CI/CD).
2. Dashboard web em Next.js com atualização contínua de progresso/fases/agentes.
3. Playground de prompts para agentes (`mike`, `isa`, `buttowski`, `hermione`, `harry`, `workflow`) com versionamento simples e rollback.

## Contexto Atual
- Aplicação em Next.js App Router com front em `src/app/page.tsx`.
- Endpoints já existentes em `src/app/api/*/route.ts`.
- Não existe área admin dedicada.
- Já existe o arquivo `.cursor/workflow-context.json` com estrutura base do estado da issue.

## Arquitetura Proposta

### Componentes
1. **Workflow Context Adapter (server-side)**
   - Módulo responsável por leitura segura de `.cursor/workflow-context.json`.
   - Exposto via API interna para dashboard e CLI.
   - Inclui sanitização e validação de schema.

2. **Prompt Registry (JSON file-based)**
   - Repositório de versões de prompts em arquivo versionado no Git.
   - API para listar, criar versão e rollback por agente.
   - Estratégia simples sem banco dedicado nesta fase.

3. **DX CLI (`codai-workflow`)**
   - Comandos para `status`, `watch`, `prompts list`, `prompts rollback`.
   - Suporte para leitura local e modo CI via `--json` e exit codes previsíveis.

4. **Dashboard DX (`/dx`)**
   - Nova rota App Router com cards de fase, timeline e saúde dos agentes.
   - Polling curto para near real-time (sem WebSocket na fase inicial).

### Diagrama de Fluxo
```mermaid
flowchart LR
  A[.cursor/workflow-context.json] --> B[Workflow Context Adapter]
  C[data/prompts/agents.json] --> D[Prompt Registry Service]
  B --> E[/api/dx/workflow]
  D --> F[/api/dx/prompts/*]
  E --> G[Dashboard /dx]
  F --> G
  E --> H[CLI codai-workflow status/watch]
  F --> I[CLI codai-workflow prompts]
  J[CI Job] --> H
```

## Decisões Arquiteturais (ADRs resumidos)

### ADR-1: Polling ao inves de WebSocket (Fase 1)
- **Decisão:** Dashboard e CLI usarão polling (2-5s configurável).
- **Motivo:** Menor complexidade operacional no Next App Router e aderente ao escopo.
- **Trade-off:** Maior overhead de requests versus push em tempo real.
- **Evolução:** Migrar para SSE/WebSocket quando houver múltiplas issues concorrentes e demanda de menor latência.

### ADR-2: Prompt store em JSON versionado no repositório
- **Decisão:** Persistir prompts em `data/prompts/agents.json`.
- **Motivo:** Simples, auditável via Git, sem dependência externa.
- **Trade-off:** Concorrência limitada para múltiplos escritores simultâneos.
- **Evolução:** Migrar para Redis/Postgres com lock otimista se conflito virar gargalo.

### ADR-3: APIs internas BFF-first
- **Decisão:** Dashboard e CLI consomem APIs internas (`/api/dx/*`) e não arquivos diretamente.
- **Motivo:** Contrato único, validação centralizada, segurança e reuso.
- **Trade-off:** Mais camada de código no backend.

### ADR-4: Compatibilidade CI/CD por contrato JSON estavel
- **Decisão:** CLI terá opção `--json` com schema estável e `--fail-on` para gates.
- **Motivo:** Facilitar integração em pipelines sem parsing frágil de texto.

## Modelo de Dados (Prompts Versionados)

Arquivo: `data/prompts/agents.json`

```json
{
  "schemaVersion": 1,
  "updatedAt": "2026-03-12T00:00:00.000Z",
  "agents": {
    "mike": {
      "activeVersion": "v3",
      "versions": [
        {
          "id": "v1",
          "createdAt": "2026-03-10T10:00:00.000Z",
          "createdBy": "carlos",
          "label": "baseline",
          "content": "Prompt completo...",
          "checksum": "sha256:...",
          "rollbackOf": null
        },
        {
          "id": "v2",
          "createdAt": "2026-03-11T09:00:00.000Z",
          "createdBy": "carlos",
          "label": "add crisis review",
          "content": "Prompt atualizado...",
          "checksum": "sha256:...",
          "rollbackOf": null
        },
        {
          "id": "v3",
          "createdAt": "2026-03-12T08:30:00.000Z",
          "createdBy": "carlos",
          "label": "rollback to v1",
          "content": "Prompt completo...",
          "checksum": "sha256:...",
          "rollbackOf": "v1"
        }
      ]
    },
    "isa": { "activeVersion": "v1", "versions": [] },
    "buttowski": { "activeVersion": "v1", "versions": [] },
    "hermione": { "activeVersion": "v1", "versions": [] },
    "harry": { "activeVersion": "v1", "versions": [] },
    "workflow": { "activeVersion": "v1", "versions": [] }
  }
}
```

### Regras de Versionamento
- `id` monotônico por agente (`v1`, `v2`, ...).
- `activeVersion` sempre aponta para uma versão existente.
- Rollback cria nova versão (append-only), preservando trilha de auditoria.
- `checksum` garante integridade do conteúdo.

## Contratos de API

### 1) Workflow Monitoring

**GET** `/api/dx/workflow`

Response `200`:
```json
{
  "jiraId": "CB-10",
  "branch": "feature/CB-10-dx-experience",
  "currentPhase": "Design",
  "retryCount": 0,
  "isCrisisMode": false,
  "agents": {
    "mike": "pending",
    "isa": "pending",
    "buttowski": "pending",
    "hermione": "pending",
    "harry": "pending"
  },
  "updatedAt": "2026-03-12T10:12:00.000Z"
}
```

Erros:
- `404` contexto inexistente.
- `422` schema inválido.
- `500` falha de leitura/parsing.

### 2) Prompt Registry

**GET** `/api/dx/prompts`
- Lista metadados por agente (versão ativa + histórico resumido).

**GET** `/api/dx/prompts/:agent`
- Detalha versões do agente.

**POST** `/api/dx/prompts/:agent/versions`

Request:
```json
{
  "content": "Novo prompt...",
  "label": "improve context handling",
  "createdBy": "carlos"
}
```

Response `201`:
```json
{
  "agent": "mike",
  "activeVersion": "v4",
  "version": {
    "id": "v4",
    "createdAt": "2026-03-12T10:20:00.000Z",
    "label": "improve context handling"
  }
}
```

**POST** `/api/dx/prompts/:agent/rollback`

Request:
```json
{
  "targetVersionId": "v2",
  "createdBy": "carlos",
  "label": "rollback after regression"
}
```

Response `200`:
```json
{
  "agent": "mike",
  "activeVersion": "v5",
  "rolledBackTo": "v2"
}
```

Validações:
- `agent` deve estar no enum suportado.
- `targetVersionId` precisa existir.
- `content` obrigatório no create.

### 3) Health Endpoint (opcional recomendado)

**GET** `/api/dx/health`
```json
{
  "ok": true,
  "checks": {
    "workflowContextReadable": true,
    "promptStoreReadable": true
  }
}
```

## CLI - Especificação Funcional

Comando base: `node scripts/codai-workflow.mjs` (futuro pacote `bin`).

### `status`
- Lê `/api/dx/workflow` (ou `--local-file` em modo offline).
- `--json`: saída estruturada para CI.
- `--fail-on phase!=QA`: retorna exit code `2` em regra violada.

### `watch`
- Polling com `--interval 2000`.
- Exibe mudanças de fase/agente em stream.
- Em CI, recomendado timeout explícito do job.

### `prompts list [agent]`
- Lista versões e marca a ativa.

### `prompts rollback <agent> <versionId>`
- Aciona endpoint de rollback.
- Exibe nova versão gerada (append-only).

## Dashboard Web - Especificação Funcional

Rota: `src/app/dx/page.tsx`

Seções:
1. **Workflow Header:** `jiraId`, branch, fase atual, retry/crise.
2. **Agents Board:** status por agente com indicadores visuais.
3. **Timeline:** eventos derivados de transições e atualizações.
4. **Prompt Playground:**
   - Seleção de agente.
   - Editor de prompt (textarea inicial).
   - Histórico de versões.
   - Ações: salvar versão, ativar/rollback.

### Estratégia de Polling
- Dashboard: 3s default, backoff para 10s quando aba inativa.
- CLI watch: 2s default, configurável.
- Cache-control: `no-store` para refletir estado atual.

## Plano Incremental de Implementação

### Fase A - Fundação de dados e contratos (3-4h)
1. Criar tipos compartilhados em `src/lib/dx/types.ts`.
2. Implementar leitor/validador de `.cursor/workflow-context.json` em `src/lib/dx/workflow-context.ts`.
3. Implementar `PromptRegistry` file-based em `src/lib/dx/prompt-registry.ts`.
4. Criar `data/prompts/agents.json` bootstrap.

**Critério de pronto:** módulos passam testes unitários de parse, validação e rollback.

### Fase B - APIs DX (3-4h)
1. Criar rotas:
   - `src/app/api/dx/workflow/route.ts`
   - `src/app/api/dx/prompts/route.ts`
   - `src/app/api/dx/prompts/[agent]/route.ts`
   - `src/app/api/dx/prompts/[agent]/versions/route.ts`
   - `src/app/api/dx/prompts/[agent]/rollback/route.ts`
2. Padronizar respostas/erros.

**Critério de pronto:** contratos validados por testes de integração.

### Fase C - Dashboard `/dx` (4-6h)
1. Criar tela inicial com cards de workflow + agentes.
2. Adicionar polling com `useEffect` + abort controller.
3. Implementar playground de prompts e ações de versão/rollback.

**Critério de pronto:** dashboard atualiza sem refresh manual e reflete mudanças do arquivo.

### Fase D - CLI + CI/CD (3-4h)
1. Implementar script CLI com parser de argumentos.
2. Comandos `status`, `watch`, `prompts list`, `prompts rollback`.
3. Documentar uso no pipeline (exemplo GitHub Actions).

**Critério de pronto:** pipeline consegue falhar/sucesso baseado em `--fail-on`.

### Fase E - Hardening (2-3h)
1. Testes E2E do dashboard e fluxo de rollback.
2. Ajustes de UX e mensagens de erro.
3. Documentação final.

**Critério de pronto:** cobertura mínima nos módulos novos e lint limpo.

## Riscos e Mitigações

1. **Concorrência no arquivo de prompts**
   - Mitigação: escrita atômica (temp file + rename) e retry simples.

2. **Schema drift em `.cursor/workflow-context.json`**
   - Mitigação: validador robusto + fallback parcial e erro explícito `422`.

3. **Carga de polling**
   - Mitigação: intervalos configuráveis, backoff em aba inativa e payload enxuto.

4. **Rollback incorreto de prompt**
   - Mitigação: operação append-only + checksum + confirmação no cliente.

5. **Uso em CI sem contexto local**
   - Mitigação: CLI com `--base-url` e `--local-file` para modos distintos.

## Critérios de Aceite Técnicos (Definition of Done)

1. **CLI**
   - `status --json` retorna schema estável.
   - `watch` detecta mudança de fase/agente em até 5s.
   - `--fail-on` respeita exit codes documentados.

2. **Dashboard**
   - Página `/dx` mostra fase, status de agentes e retry/crise.
   - Atualização por polling sem reload manual.
   - Playground permite criar versão e rollback com confirmação visual.

3. **APIs**
   - Endpoints `/api/dx/*` implementados com validação de entrada.
   - Erros padronizados (`400/404/422/500`) e mensagens claras.

4. **Dados e integridade**
   - `data/prompts/agents.json` mantém histórico append-only.
   - Rollback não deleta histórico e cria nova versão ativa.

5. **Qualidade**
   - Lint sem erros nos novos arquivos.
   - Testes unitários para serviços e integração para APIs.
   - Documentação de uso CLI + dashboard para time.

## Próximo Passo
Submeter este plano ao Buttowski para peer review de design e, após aprovação, iniciar implementação com Isa em branch `feature/CB-10-dx-experience`.

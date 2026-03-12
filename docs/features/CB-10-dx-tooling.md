# CB-10: Developer Experience Toolkit

Este documento descreve as ferramentas de DX adicionadas para operacao do workflow de agentes.

## O que foi entregue

- **CLI de Workflow** (`scripts/workflow-cli.mjs`)
  - `status`: mostra o estado atual da issue.
  - `watch`: monitora mudancas por polling.
  - `prompts list`: lista versoes de prompts.
  - `prompts rollback`: executa rollback append-only de prompt.
- **Dashboard Admin** (`/admin/workflow`)
  - Leitura em tempo quase real (polling) de `.cursor/workflow-context.json` via API.
  - Exibicao de fase atual, estado dos agentes e timeline.
- **Playground de Prompts** (`/admin/prompts`)
  - Edicao e publicacao de novas versoes.
  - Rollback criando nova versao derivada (`rollbackFrom`).

## Endpoints DX

- `GET /api/dx/workflow`
- `GET /api/dx/prompts`
- `GET /api/dx/prompts/[agent]`
- `POST /api/dx/prompts/[agent]/versions`
- `POST /api/dx/prompts/[agent]/rollback`
- `GET /api/dx/health`

## Uso da CLI

```bash
# status local (arquivo .cursor/workflow-context.json)
npm run workflow:status

# status estruturado para CI
node scripts/workflow-cli.mjs status --json --fail-on phase=QA

# monitoramento continuo
npm run workflow:watch -- --interval 2000 --timeout 60000

# listar prompts
node scripts/workflow-cli.mjs prompts list

# rollback de prompt via API (app rodando localmente)
node scripts/workflow-cli.mjs prompts rollback mike v1 --base-url http://localhost:3000
```

## CI/CD

Exemplo de gate basico:

```bash
node scripts/workflow-cli.mjs status --json --fail-on phase=QA
```

- Exit code `0`: sucesso.
- Exit code `1`: erro funcional/runtime.
- Exit code `2`: timeout ou condicao de gate nao atendida.

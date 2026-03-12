# Planejamento Tecnico: CB-10 - Experiencia do Desenvolvedor (DX)

## Objetivo
Entregar uma camada de operacao para o workflow de agentes com:

1. CLI para monitoramento e uso em CI/CD.
2. Dashboard admin com atualizacao via polling.
3. Playground de prompts com versionamento simples e rollback append-only.

## Decisoes de Design (Mike)

- Polling na fase inicial para reduzir complexidade operacional.
- Contratos unicos via API (`/api/dx/*`) para dashboard e CLI.
- Leitura do estado do workflow a partir de `.cursor/workflow-context.json`.
- Registro de prompts em `data/prompts/agents.json` com checksum e historico imutavel.
- Rollback sempre cria nova versao (nao sobrescreve historico).

## Checklist de Qualidade (Buttowski)

- Definir contrato de CLI com codigos de saida previsiveis.
- Suportar modo nao interativo (`--json`, `--no-color`, `--timeout`).
- Validar schema minimo de workflow context com fallback seguro.
- Retornar payload estavel no endpoint de polling com `updatedAt` e `stale`.
- Proteger semantica de rollback com trilha auditavel (`rollbackFrom`).
- Entregar testes e lint sem erros para novos modulos.

## API Contracts

- `GET /api/dx/workflow`: status atual do workflow.
- `GET /api/dx/prompts`: resumo de versoes por agente.
- `GET /api/dx/prompts/[agent]`: detalhe completo de versoes.
- `POST /api/dx/prompts/[agent]/versions`: cria nova versao de prompt.
- `POST /api/dx/prompts/[agent]/rollback`: cria versao de rollback.

## Entrega Incremental

1. Fundacao de tipos e adaptadores (`src/lib/dx/*`).
2. APIs DX (`src/app/api/dx/*`).
3. Dashboard admin (`src/app/admin/workflow`).
4. Playground admin (`src/app/admin/prompts`).
5. CLI (`scripts/workflow-cli.mjs`) com comandos de status/watch/prompts.
6. QA (lint/build/e2e) e documentacao de DX.

## Aprovacao

- Mike (Principal Engineer): aprovado.
- Buttowski (Tech Lead): aprovado com ajustes aplicados no contrato da CLI e versionamento.

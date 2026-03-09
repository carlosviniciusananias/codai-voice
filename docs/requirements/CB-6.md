# CB-6 - [CV] - Gerenciar Versões na Sessão

**URL:** https://codaivoice.atlassian.net/browse/CB-6
**Status Atual:** Em andamento
**Prioridade:** Medium

## Descrição
Armazenar versões temporárias do componente na sessão anônima.

## Critérios de Aceite
* Criar session_id UUID
* Salvar versões em memória ou Redis
* TTL configurado (ex: 24h)
* Limite de componentes por sessão (ex: 5)

## Observações Relevantes
* Não usar banco relacional neste MVP
* Implementar limpeza automática via TTL

## Requisitos Técnicos
- [ ] Implementar middleware ou utilitário para gerenciamento de `session_id` via cookies.
- [ ] Configurar cliente Redis (Upstash) para armazenamento das versões.
- [ ] Criar API endpoints para salvar e recuperar versões por sessão.
- [ ] Implementar lógica de limite de versões (máximo 5) com política de substituição (ex: FIFO).
- [ ] Garantir TTL de 24h nas chaves do Redis.

## Definição de Pronto
- [ ] Código implementado
- [ ] Testes unitários (>80%)
- [ ] Testes E2E com Playwright
- [ ] Code review aprovado
- [ ] QA Agent validado
- [ ] PR criado e vinculado

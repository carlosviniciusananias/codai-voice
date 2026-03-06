# CB-3 - [CV] - Implementar Campo Manual de Prompt

**URL:** https://codaivoice.atlassian.net/browse/CB-3
**Status Atual:** Em andamento
**Prioridade:** Medium

## Descrição
Adicionar campo de texto para permitir que usuário descreva componente manualmente no Studio. Atualmente existe uma implementação parcial e redundante diretamente na Home.

## Critérios de Aceite
- [ ] Campo editável
- [ ] Botão “Gerar componente”
- [ ] Validação de prompt vazio
- [ ] Limite de caracteres (ex: 500)
- [ ] Mesma integração com o endpoint de geração usado pela voz

## Requisitos Técnicos
- [ ] Refatorar `src/app/components/PromptInput.tsx` para ser o componente oficial de entrada manual.
- [ ] Adicionar contador de caracteres (0/500).
- [ ] Garantir que o botão de envio seja desabilitado se o campo estiver vazio ou acima do limite.
- [ ] Integrar na `src/app/page.tsx` removendo o `textarea` redundante.
- [ ] Sanitizar entrada antes de enviar para o backend.

## Definição de Pronto
- [ ] Código implementado seguindo os padrões Clean Code e SOLID.
- [ ] Testes E2E com Playwright cobrindo o fluxo manual.
- [ ] Code review aprovado.
- [ ] QA Agent validado.
- [ ] PR criado e vinculado ao card no Jira.

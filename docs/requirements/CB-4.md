# [CB-4] - [CV] - Implementar Sandbox de Preview

**URL:** https://codaivoice.atlassian.net/browse/CB-4
**Status Atual:** Em andamento
**Prioridade:** Medium

## Descrição
Criar ambiente isolado (iframe) para renderizar componente gerado.

## Critérios de Aceite
- [ ] Código deve ser compilado dinamicamente
- [ ] Exibir componente renderizado
- [ ] Exibir erro de compilação caso falhe
- [ ] Não travar aplicação principal

## Requisitos Técnicos
- [ ] Implementar componente de Sandbox usando `iframe`
- [ ] Utilizar `postMessage` para comunicação segura entre a app e o iframe
- [ ] Integrar com um bundler/compiler client-side (ex: `@babel/standalone` ou similar se necessário, ou renderização direta de HTML/JS)
- [ ] Sanitização de código para evitar ataques XSS
- [ ] Tratamento de erros de runtime e renderização

## Definição de Pronto
- [ ] Código implementado
- [ ] Testes unitários (>80%)
- [ ] Testes E2E com Playwright
- [ ] Code review aprovado
- [ ] QA Agent validado
- [ ] PR criado e vinculado

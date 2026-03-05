# CB-3 - [CV] - Implementar Campo Manual de Prompt

**URL:** https://codaivoice.atlassian.net/browse/CB-3
**Status:** Tarefas pendentes
**Prioridade:** Medium (Assumida)

## Descrição
Adicionar campo de texto para permitir que usuário descreva componente manualmente.

**Critérios de aceite**
* Campo editável
* Botão “Gerar componente”
* Validação de prompt vazio
* Limite de caracteres (ex: 500)

**Observações Relevantes**
* Mesmo endpoint será usado para voz e texto
* Sanitizar entrada antes de enviar para backend

## Critérios de Aceite
- [ ] Campo editável
- [ ] Botão “Gerar componente”
- [ ] Validação de prompt vazio
- [ ] Limite de caracteres (ex: 500)

## Requisitos Técnicos
- [ ] Implementar componente de textarea com limite de caracteres
- [ ] Implementar botão de submissão
- [ ] Adicionar lógica de validação para prompt vazio
- [ ] Integrar com o endpoint de geração de componente (mesmo usado para voz)
- [ ] Garantir sanitização do input

## Definição de Pronto
- [ ] Código implementado
- [ ] Testes unitários (>80%)
- [ ] Testes E2E
- [ ] Code review aprovado
- [ ] PR criado

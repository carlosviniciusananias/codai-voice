# CB-8 - [CV] - Preview Responsivo Multidispositivo

**URL:** https://codaivoice.atlassian.net/browse/CB-8
**Status Atual:** Tarefas pendentes
**Prioridade:** N/A

## Descrição
Implementar uma barra de ferramentas no topo do preview que permita alternar rapidamente entre visualizações de Mobile, Tablet e Desktop, garantindo que o código gerado pela IA seja realmente responsivo.

## Critérios de Aceite
- [ ] Botões de alternância para resoluções padrão (375px, 768px, 1024px, 1440px).
- [ ] Animação suave de redimensionamento do container do iframe.
- [ ] Indicador visual da resolução atual.

## Requisitos Técnicos
- [ ] Criar componente de Toolbar para o Preview.
- [ ] Integrar Toolbar com o container do `PreviewSandbox`.
- [ ] Garantir que o redimensionamento não quebre a comunicação via `postMessage`.

## Definição de Pronto
- [ ] Código implementado
- [ ] Testes unitários (>80%)
- [ ] Testes E2E com Playwright
- [ ] Code review aprovado
- [ ] QA Agent validado
- [ ] PR criado e vinculado

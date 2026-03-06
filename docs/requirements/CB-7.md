# CB-7 - [CV] - Implementação da funcionalidade "Explain-to-Me" (Explicação de Código Gerado)

**URL:** https://codaivoice.atlassian.net/browse/CB-7
**Status Atual:** Tarefas pendentes
**Prioridade:** Alta

## Descrição
O objetivo desta tarefa é implementar um recurso educativo dentro do editor de componentes. Ao finalizar a geração de um componente front-end via voz, o usuário deve ter a opção de solicitar uma explicação técnica detalhada sobre as decisões de arquitetura e estilização tomadas pela IA. Isso visa transformar a ferramenta não apenas em um gerador de código, mas em uma plataforma de aprendizado ativo, ajudando o estudante a entender o "porquê" por trás das implementações (ex: por que usar Flexbox em vez de Grid, ou por que um useEffect foi necessário naquele contexto).

## Critérios de Aceite
- **Interface (UI):** Deve ser adicionado um botão visualmente distinto (ex: ícone de lâmpada ou interrogação) próximo ao painel de visualização do código/componente.
- **Estado de Loading:** O botão deve exibir um estado de "carregamento" (loading) enquanto a explicação é gerada.
- **Integração com LLM:** Ao clicar no botão, o sistema deve enviar o código gerado e o prompt original do usuário de volta para a API da IA.
- **Explicação Estruturada:** A IA deve retornar uma explicação estruturada focando em: Escolhas de Layout (CSS), Gerenciamento de Estado (Hooks) e Semântica HTML.
- **Exibição (UX):** A explicação deve ser exibida em um componente lateral (Sidebar) ou em um Modal de leitura agradável.
- **Markdown:** O texto deve suportar formatação Markdown para destacar trechos de código dentro da explicação.
- **Performance:** A chamada para explicação não deve bloquear a interação com o componente já renderizado.

## Requisitos Técnicos
- [ ] Nova rota de API `src/app/api/explain/route.ts` usando Groq SDK.
- [ ] Prompt de sistema específico para "tutor sênior de React".
- [ ] Componente `ExplanationSidebar.tsx` para exibição lateral.
- [ ] Suporte a Markdown e Syntax Highlighting na explicação.
- [ ] Integração no `src/app/page.tsx`.

## Definição de Pronto
- [ ] Código implementado
- [ ] Testes unitários (>80%)
- [ ] Testes E2E com Playwright
- [ ] Code review aprovado
- [ ] QA Agent validado
- [ ] PR criado e vinculado

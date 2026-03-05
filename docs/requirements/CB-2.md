# CB-2 - [CV] - Botão download do código gerado

**URL:** https://codaivoice.atlassian.net/browse/CB-2
**Status:** Tarefas pendentes
**Prioridade:** Medium

## Descrição
Desenvolver e integrar a funcionalidade de exportação de código, permitindo que o usuário baixe o componente visualizado diretamente como um arquivo utilizável no formato `.tsx` (TypeScript React). O foco deve ser a praticidade e a garantia de que o arquivo exportado siga as melhores práticas de codificação. 🛠️

## Critérios de Aceite
1. **Geração Dinâmica:** O sistema deve converter o estado atual do componente em uma string de código válida e formatada. 📄
2. **Download Direto:** Ao clicar no botão de exportação, o navegador deve iniciar o download automático do arquivo com a extensão `.tsx`.
3. **Sanitização de Nome:** O nome do arquivo deve ser gerado com base no título do componente, removendo caracteres especiais e espaços (ex: `MeuComponente.tsx`). 🧹
4. **Feedback Visual:** Implementar um indicador de "Exportando..." e uma notificação de sucesso após a conclusão do download.
5. **Compatibilidade de Imports:** O código gerado deve incluir os `imports` básicos necessários (ex: React, Lucide Icons, ou a biblioteca de componentes utilizada).

## Requisitos Técnicos
- [ ] Implementar lógica de download client-side (Blob/URL.createObjectURL)
- [ ] Criar função de sanitização de nomes de arquivos
- [ ] Adicionar botão de download na interface do Studio (próximo ao código fonte)
- [ ] Garantir que o código exportado seja uma string TSX válida
- [ ] Adicionar notificações de feedback (Sucesso/Erro)

## Definição de Pronto
- [ ] Código implementado
- [ ] Testes unitários (>80%)
- [ ] Testes E2E
- [ ] Code review aprovado
- [ ] PR criado

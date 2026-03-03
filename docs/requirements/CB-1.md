# CB-1 — [CV] - Implementar design pattern

- **Jira**: `https://codaivoice.atlassian.net/browse/CB-1`
- **Status (no momento da ingestão)**: Tarefas pendentes
- **Status (após transição)**: Em andamento

## Contexto

O objetivo é desenvolver e implementar a nova interface do usuário (UI) do projeto, priorizando um design moderno, limpo e minimalista, reduzindo a carga cognitiva e entregando uma jornada intuitiva.

## Objetivos

- Entregar uma UI **responsiva** (Desktop/Tablet/Mobile).
- Simplificar a **navegação** para que as principais funcionalidades fiquem a poucos cliques.
- Garantir **consistência visual** via biblioteca de componentes.
- Garantir **acessibilidade (a11y)** básica e feedbacks claros ao usuário.
- Manter **performance** aceitável com Lighthouse \(\ge 80\).

## Escopo (MVP)

- Layout responsivo e componentes padronizados.
- Menu principal com **no máximo 5 itens**, rotas claras e sem loops.
- Estados de **loading**, **erro** (mensagens claras) e **sucesso** (confirmações).
- A11y: contraste adequado, tags semânticas HTML5 e suporte básico a leitores de tela.
- Otimização de imagens (preferência por WebP) para não degradar performance.

## Fora de escopo (por enquanto)

- Redesign profundo de regras de negócio / fluxos além do necessário para a nova UI.
- Otimizações avançadas de performance fora do critério Lighthouse mínimo.

## Critérios de aceite (do Jira)

- **Design Responsivo**: funcional e visualmente adaptado para Desktop, Tablet e Mobile.
- **Navegação Simplificada**: menu principal com no máximo 5 itens, rotas claras e sem loops.
- **Velocidade de Carregamento**: pontuação mínima de 80 no Lighthouse (Performance).
- **Consistência Visual**: uso de biblioteca de componentes (ex: Tailwind, Material UI ou Shadcn/ui).
- **Acessibilidade (a11y)**: contraste adequado, HTML5 semântico e suporte básico a leitores de tela.
- **Feedback ao Usuário**: loading, erros claros e confirmações de sucesso.

## Referências e dependências

- O card menciona um protótipo hi-fi (Figma/Adobe XD), porém **não há link/anexo no ticket**. Precisamos do link/arquivo antes de iniciar a implementação visual fina.

## Plano técnico (alto nível)

- Mapear as telas/rotas atuais e reduzir o menu para \(\le 5\) itens.
- Definir padrão de componentes (Tailwind + biblioteca já existente no projeto, ou adoção controlada).
- Ajustar layout responsivo e estados de feedback (loading/erro/sucesso).
- Validar performance com Lighthouse e corrigir regressões.
- Adicionar/ajustar testes E2E (Playwright) para rotas e navegação principais.

## Plano de validação

- Checklist manual: Desktop/Tablet/Mobile (responsivo), navegação sem loops, feedbacks presentes.
- Lighthouse: Performance \(\ge 80\) nas principais páginas/rotas.
- A11y: verificação de contraste e landmarks semânticos (header/nav/main/footer).


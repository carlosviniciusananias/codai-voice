---
**Status:** Aprovado ✅
**Aprovador:** Buttowski (Tech Lead)
**Data:** 10/03/2026
**Comentários:** O plano está excelente e atende a todos os critérios de aceite. A escolha de resoluções (375px, 768px, 1024px, 1440px) cobre bem os principais breakpoints. O uso de animações CSS para o redimensionamento trará uma experiência fluida sem adicionar complexidade desnecessária.

**Próximo Passo:** Isa (Full Stack Engineer) pode iniciar a implementação.
---
# Plano Técnico - CB-8: Preview Responsivo Multidispositivo

## Arquitetura da Solução
A solução consiste em adicionar uma barra de ferramentas (Toolbar) ao componente de Preview que permita ao usuário alternar entre diferentes resoluções predefinidas. O redimensionamento será aplicado ao container do `iframe` no `PreviewSandbox` com uma animação suave de transição.

### Componentes e Responsabilidades
1.  **`PreviewToolbar` (Novo):** Componente que contém os botões de alternância (Mobile, Tablet, Desktop) e o indicador da resolução atual.
2.  **`PreviewSandbox` (Modificado):** Receberá um novo prop `viewMode` ou `width` para controlar o tamanho do container interno que envolve o `iframe`.
3.  **`Home` (Modificado em `src/app/page.tsx`):** Gerenciará o estado da resolução selecionada e coordenará a comunicação entre a Toolbar e o Sandbox.

## Arquivos a Criar/Modificar
- `src/components/PreviewSandbox/PreviewToolbar.tsx` (Novo) - Interface com botões de dispositivos.
- `src/components/PreviewSandbox/PreviewSandbox.tsx` (Modificar) - Adicionar suporte a redimensionamento dinâmico e animação.
- `src/components/PreviewSandbox/index.ts` (Modificar) - Exportar o novo componente.
- `src/app/page.tsx` (Modificar) - Integrar a Toolbar acima do Preview e gerenciar o estado global da visualização.

## Dependências
- `lucide-react` - Para os ícones de dispositivos (Smartphone, Tablet, Monitor, Laptop). Já instalado.
- `framer-motion` (Opcional, mas recomendado para animações suaves) - Verificar se está disponível ou usar CSS Transitions.

## Passo a Passo

### 1. Criação da Toolbar (`PreviewToolbar.tsx`)
- Implementar botões para as resoluções:
    - **Mobile:** 375px
    - **Tablet:** 768px
    - **Laptop:** 1024px
    - **Desktop:** 1440px (ou 100% do container)
- Adicionar tooltip ou label indicando a resolução exata.
- Estilizar seguindo o padrão visual do projeto (Zinc/Emerald).

### 2. Evolução do `PreviewSandbox.tsx`
- Adicionar prop `width` (string | number).
- Envolver o `iframe` em um `div` com `transition: width 0.3s ease-in-out`.
- Centralizar o container de preview quando a largura for menor que 100%.
- Garantir que o `postMessage` continue funcionando independentemente do tamanho do container.

### 3. Integração na `Home` (`src/app/page.tsx`)
- Criar estado `previewWidth` com valor inicial "100%".
- Posicionar a `PreviewToolbar` dentro do `CardHeader` do Preview ou logo acima do `CardContent`.
- Passar o estado `previewWidth` para o `PreviewSandbox`.

## Riscos e Mitigações
- **Quebra de Layout:** O redimensionamento do iframe pode causar problemas de scroll. *Mitigação:* Garantir `overflow: hidden` no container pai e `overflow: auto` dentro do iframe.
- **Performance:** Animações de redimensionamento podem ser pesadas. *Mitigação:* Usar `will-change: width` e transições CSS otimizadas.
- **Responsividade da própria Toolbar:** A toolbar deve ser funcional em telas menores. *Mitigação:* Usar ícones sem texto em resoluções mobile da aplicação principal.

## Testes
- **Unitários:** Testar se a Toolbar dispara o evento de mudança com os valores corretos.
- **Integração:** Verificar se o `PreviewSandbox` reflete a largura passada via props.
- **E2E (Playwright):** Validar se ao clicar no botão "Mobile", o iframe assume a largura de 375px.

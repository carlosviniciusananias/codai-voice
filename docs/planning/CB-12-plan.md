# Plano Técnico - CB-12: Refatoração da UI de Preview

## 1. Visão Geral
O objetivo é consolidar a visualização de código e preview, que atualmente ocupam duas colunas distintas, em uma única coluna dinâmica. Isso otimizará o espaço de tela, especialmente em resoluções menores, e proporcionará uma experiência mais focada.

## 2. Mudanças Arquiteturais e de UI

### 2.1. Unificação da Coluna de Visualização
- No arquivo `src/app/page.tsx`, a estrutura de grid `xl:grid-cols-2` (linhas 395-396) será removida.
- O código e o preview serão integrados em um único componente de `Card` ou container com abas.

### 2.2. Sistema de Abas (Tabs)
- Implementar um sistema de abas no cabeçalho do novo Card unificado para alternar entre "Preview" e "Código".
- Utilizar o componente `Tabs` do Radix UI (ou similar já presente no projeto) para garantir acessibilidade e transições suaves.

### 2.3. Integração de Ações
- Os botões de ação ("Explicar Código", "Baixar .tsx") e o `PreviewToolbar` (seleção de largura) serão consolidados no cabeçalho do Card unificado.
- O cabeçalho será adaptativo: mostrará controles de largura apenas na aba "Preview" e botões de exportação/explicação em ambas ou apenas na aba "Código", conforme a relevância.

### 2.4. Refatoração de Componentes
- **`PreviewSandbox`**: Permanecerá como o container do iframe, mas sua largura será controlada pelo estado unificado.
- **`PreviewToolbar`**: Pode ser simplificado ou integrado diretamente no cabeçalho do Card.

## 3. Detalhes de Implementação

### Estado da UI
Adicionar um novo estado para controlar a aba ativa:
```typescript
const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
```

### Estrutura de Layout Sugerida
```tsx
<Card className="flex flex-col flex-1 ...">
  <CardHeader className="...">
    <div className="flex items-center justify-between">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="code">Código</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="flex items-center gap-2">
        {activeTab === "preview" && <PreviewToolbar ... />}
        <Button onClick={handleExplain}>...</Button>
        <Button onClick={handleExport}>...</Button>
      </div>
    </div>
  </CardHeader>
  <CardContent className="p-0 flex-1">
    {activeTab === "preview" ? (
      <PreviewSandbox ... />
    ) : (
      <div className="relative h-full bg-zinc-950">
        <pre>...</pre>
      </div>
    )}
  </CardContent>
</Card>
```

## 4. Riscos e Mitigações
- **Responsividade**: A remoção da segunda coluna melhora a visualização em telas médias, mas o cabeçalho do Card pode ficar sobrecarregado de botões.
  - *Mitigação*: Usar ícones sem labels em telas menores ou um menu dropdown para ações secundárias.
- **Performance**: O iframe do sandbox não deve ser recriado desnecessariamente ao alternar abas.
  - *Mitigação*: Usar CSS (`display: none`) ou manter o estado do iframe se possível, embora o `PreviewSandbox` atual já lide bem com re-renders via `postMessage`.

---

## 📋 Task Breakdown (Buttowski)

### 1. Preparação e Estado
- [ ] Criar estado `activeTab` no componente `Home` (`src/app/page.tsx`) com valor inicial `"preview"`.
- [ ] Importar componentes de UI necessários para abas (ex: `Tabs`, `TabsList`, `TabsTrigger` de `@/components/ui/tabs`).

### 2. Reestruturação do Layout (Isa)
- [ ] Remover o grid de duas colunas (`xl:grid-cols-2`) na seção de visualização do `src/app/page.tsx`.
- [ ] Consolidar os dois `Card`s existentes em um único `Card` principal.
- [ ] Implementar o componente `Tabs` no `CardHeader` para alternar entre "Preview" e "Código".

### 3. Integração de Ações e Toolbar
- [ ] Mover os botões de "Explicar Código" e "Baixar .tsx" para o `CardHeader` unificado.
- [ ] Integrar o `PreviewToolbar` no `CardHeader`, garantindo que ele só apareça quando a aba "Preview" estiver ativa.
- [ ] Ajustar o layout do cabeçalho para que os elementos fiquem bem distribuídos em diferentes larguras de tela.

### 4. Conteúdo Dinâmico (Isa)
- [ ] Renderizar condicionalmente o `PreviewSandbox` ou o bloco de `pre`/`code` baseado no estado `activeTab`.
- [ ] Garantir que o estado de carregamento (`isLoading`) e o estado de erro do sandbox (`sandboxError`) continuem funcionando corretamente no novo layout.

### 5. Polimento e QA (Hermione)
- [ ] Verificar se a alternância entre abas é fluida e não causa "flickering" no preview.
- [ ] Validar a responsividade do novo layout em resoluções mobile, tablet e desktop.
- [ ] Garantir que todas as funcionalidades originais (exportação, explicação, correção com IA) permanecem operacionais.

---
**Aprovado por:** Mike (Principal Engineer)
**Data:** 12/03/2026

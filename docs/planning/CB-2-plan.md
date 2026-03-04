# Plano Técnico - CB-2: Botão download do código gerado

## Arquitetura da Solução
A funcionalidade de exportação será implementada inteiramente no lado do cliente (client-side) para garantir performance e privacidade. Utilizaremos a API de `Blob` do navegador para gerar um arquivo temporário e disparar o download.

## Arquivos a Criar/Modificar
- `src/app/utils/export-utils.ts` - Criar utilitário para sanitização de nomes e lógica de download.
- `src/app/page.tsx` - Adicionar o botão de download no card de "Código Fonte" e integrar a lógica de exportação.

## Dependências
- `lucide-react` (já instalada) - Para o ícone de download.

## Passo a Passo
1. **Utilitário de Exportação:**
   - Criar `sanitizeFileName(name: string): string` para remover caracteres especiais.
   - Criar `downloadAsTsx(code: string, fileName: string): void` usando `Blob` e `URL.createObjectURL`.
2. **Integração na UI:**
   - Importar o ícone `Download` do `lucide-react`.
   - Adicionar o botão de download no `CardHeader` do card de "Código Fonte".
   - O botão deve estar desabilitado se não houver código gerado.
3. **Feedback ao Usuário:**
   - Implementar estado local de "exportando" (mesmo que instantâneo, para consistência de UI).
   - Utilizar um `toast` ou notificação simples (se disponível no projeto, caso contrário, feedback via estado).

## Riscos e Mitigações
- **Segurança do Conteúdo:** O código gerado é apenas texto, mas garantiremos que o download seja tratado como um arquivo estático pelo navegador.
- **Compatibilidade de Browser:** A API de `Blob` é amplamente suportada em navegadores modernos (Desktop/Mobile).

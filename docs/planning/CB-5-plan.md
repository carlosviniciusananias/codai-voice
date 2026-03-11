# Plano Técnico - CB-5: Tratamento de Erros de Renderização e Logging

## 🎯 Objetivo
Implementar um sistema robusto de captura de erros no frontend (especificamente no sandbox de preview) e garantir que esses erros sejam logados no backend para monitoramento, sem expor informações sensíveis ao usuário final.

## 🏗️ Arquitetura da Solução

A solução será dividida em três camadas:
1.  **Sandbox (Iframe):** Captura de erros de runtime e sintaxe dentro do ambiente isolado.
2.  **Frontend (Main App):** Interface amigável para exibição do erro e integração com o backend.
3.  **Backend (API):** Endpoint seguro para persistência dos logs de erro.

### 1. Camada de Sandbox (`PreviewSandbox.tsx`)
O `PreviewSandbox` já possui uma estrutura básica de captura via `window.onerror` e `postMessage`. Vamos refinar para:
- Capturar erros de renderização do React (se aplicável no futuro) ou erros de execução do script injetado.
- Enviar o `stack` apenas para o log interno, enviando uma mensagem simplificada para o usuário.

### 2. Camada de Frontend (`src/app/page.tsx`)
- Implementar um mecanismo que, ao receber um erro do sandbox, dispare uma chamada para a nova API de log.
- Exibir um componente de "Error State" no preview que permita ao usuário clicar em um botão para "Tentar Corrigir" (enviando o erro de volta para a IA como contexto).

### 3. Camada de Backend (`src/app/api/log-error/route.ts`)
- Criar um novo endpoint `POST /api/log-error`.
- O log deve incluir: mensagem de erro, stack trace (se disponível), código que gerou o erro e timestamp.
- Utilizar o `console.error` (que em produção é capturado por ferramentas como Vercel Logs/Sentry).

## 📂 Arquivos a Criar/Modificar

### Criar
- `src/app/api/log-error/route.ts`: Endpoint para receber logs do frontend.

### Modificar
- `src/components/PreviewSandbox/PreviewSandbox.tsx`: Refinar captura de erros e comunicação via `postMessage`.
- `src/app/page.tsx`: Lógica para exibir erro amigável e disparar o log para o backend.
- `src/app/components/ui/error-display.tsx` (Opcional/Novo): Componente visual para erros de renderização.

## 🛠️ Passo a Passo

1.  **Backend Logging:**
    - Implementar `src/app/api/log-error/route.ts` com validação de payload.
2.  **Refinamento do Sandbox:**
    - Atualizar o script injetado no `srcDoc` do iframe para garantir que todos os erros (incluindo `unhandledrejection`) enviem o stack trace.
3.  **Integração no Frontend:**
    - No `useEffect` de mensagens do `PreviewSandbox`, adicionar a chamada para `fetch('/api/log-error', ...)`.
    - Atualizar o estado de erro para ser mais do que apenas uma string (incluir metadados).
4.  **UX de Recuperação:**
    - Adicionar botão "Tentar Corrigir com IA" no display de erro, que chama `handleGenerate` com o prompt original + descrição do erro.

## 🧪 Plano de Testes

### Testes Unitários
- Testar o endpoint de log com diferentes payloads.
- Testar a função de formatação de erro amigável.

### Testes E2E (Playwright)
- Simular a geração de um código inválido (ex: `console.log(undefinedVariable)`).
- Verificar se o alerta de erro aparece no preview.
- Verificar se o log foi enviado (mockando a chamada de API).

## ⚠️ Riscos e Mitigações
- **Exposição de Dados:** Mitigação: O backend filtrará o stack trace antes de qualquer persistência externa se necessário, e o frontend nunca exibirá o stack trace bruto para o usuário.
- **Spam de Logs:** Mitigação: Implementar rate limiting no endpoint de log (similar ao de geração).

---
---
**Status:** Aprovado ✅
**Aprovador:** Buttowski (Tech Lead)
**Data:** 10/03/2026
**Comentários:** Plano técnico robusto. A separação entre sandbox, frontend e backend atende perfeitamente aos requisitos de segurança e UX. A inclusão do botão "Tentar Corrigir com IA" é um excelente diferencial de DX.

**Próximo Passo:** Isa (Full Stack Engineer) pode iniciar a implementação.
---
**Status:** Pronto para revisão.
**Responsável:** Mike (Principal Engineer)
**Revisor Sugerido:** Buttowski (Tech Lead)

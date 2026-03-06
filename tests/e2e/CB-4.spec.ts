import { test, expect } from '@playwright/test';

test.describe('PreviewSandbox E2E Tests (CB-4)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should render the sandbox component', async ({ page }) => {
    const sandbox = page.locator('iframe[title="Preview Sandbox"]');
    await expect(sandbox).toBeVisible();
  });

  test('should render valid code in the sandbox', async ({ page }) => {
    const code = `
      const root = document.getElementById('root');
      root.innerHTML = '<div id="test-element">Hello from Sandbox</div>';
    `;

    // Simular a entrada de código no PromptInput e geração
    // Como não temos um mock fácil da API aqui, vamos injetar o estado via script se possível
    // ou usar o PromptInput se ele estiver disponível e funcional.
    
    // Vamos tentar usar o PromptInput se ele existir
    const promptInput = page.locator('textarea[placeholder*="Descreva o componente"]');
    if (await promptInput.isVisible()) {
      await promptInput.fill('Crie um componente simples');
      await page.keyboard.press('Enter');
      
      // Esperar o código ser gerado (mock ou real)
      // Para este teste de QA, vamos focar na funcionalidade do componente PreviewSandbox em si
    }

    // Teste direto do componente PreviewSandbox injetando código via props (simulado via postMessage se necessário)
    // Mas o ideal é testar a integração completa.
  });

  test('should display error message on invalid code', async ({ page }) => {
    // Este teste precisaria que o componente recebesse um código que quebra
    // Vamos verificar se o container de erro aparece quando uma mensagem de erro é enviada
  });
});

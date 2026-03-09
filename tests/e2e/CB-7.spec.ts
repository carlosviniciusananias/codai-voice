import { test, expect } from '@playwright/test';

test.describe('Explain-to-Me Feature E2E Tests (CB-7)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should validate the complete Explain-to-Me flow', async ({ page }) => {
    await test.step('1. Ensure "Explain-to-Me" button exists in Source Code card header', async () => {
      // Mocking a generated code state if needed, but here we'll generate one
      const manualModeButton = page.locator('button[title="Manual"]');
      await manualModeButton.click();

      const promptInput = page.locator('textarea[placeholder*="Descreva o componente"]');
      await promptInput.fill('Crie um card de perfil simples');
      
      const generateButton = page.getByRole('button', { name: /Gerar componente/i });
      await generateButton.click();

      // Wait for code generation
      await expect(page.locator('pre code')).not.toContainText('// Fale para gerar o código...', { timeout: 30000 });

      const explainButton = page.getByRole('button', { name: /Explicar Código/i });
      await expect(explainButton).toBeVisible();
    });

    await test.step('2. Clicking the button triggers a loading state', async () => {
      const explainButton = page.getByRole('button', { name: /Explicar Código/i });
      await explainButton.click();
      
      const explainingButton = page.getByRole('button', { name: /Explicando.../i });
      await expect(explainingButton).toBeVisible();
    });

    await test.step('3. The ExplanationSidebar opens with AI-generated explanation', async () => {
      const sidebarTitle = page.getByText('Explicação do Tutor');
      await expect(sidebarTitle).toBeVisible({ timeout: 30000 });
      
      const markdownContent = page.locator('.prose');
      await expect(markdownContent).toBeVisible();
      // Check if it contains some typical markdown structure (like a paragraph or list)
      const paragraph = markdownContent.locator('p');
      await expect(paragraph.first()).toBeVisible();
    });

    await test.step('4. Generating new code resets explanation and closes sidebar', async () => {
      const promptInput = page.locator('textarea[placeholder*="Descreva o componente"]');
      await promptInput.fill('Agora crie um botão vermelho');
      
      const generateButton = page.getByRole('button', { name: /Gerar componente/i });
      await generateButton.click();

      const sidebarTitle = page.getByText('Explicação do Tutor');
      await expect(sidebarTitle).not.toBeVisible();
    });
  });

  test('should handle error 429 (Too Many Requests)', async ({ page }) => {
    await test.step('1. Mock 429 error from /api/explain', async () => {
      await page.route('**/api/explain', async route => {
        await route.fulfill({
          status: 429,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Too many requests' }),
        });
      });

      // Generate code first to enable explain button
      const manualModeButton = page.locator('button[title="Manual"]');
      await manualModeButton.click();
      const promptInput = page.locator('textarea[placeholder*="Descreva o componente"]');
      await promptInput.fill('Teste de erro');
      await page.getByRole('button', { name: /Gerar componente/i }).click();
      await expect(page.locator('pre code')).not.toContainText('// Fale para gerar o código...', { timeout: 30000 });

      const explainButton = page.getByRole('button', { name: /Explicar Código/i });
      await explainButton.click();

      const errorMessage = page.getByText('Muitas solicitações. Por favor, aguarde um momento.');
      await expect(errorMessage).toBeVisible();
    });
  });
});

import { test, expect } from '@playwright/test';

test.describe('Explain-to-Me Feature E2E Tests (CB-7)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show Explain button after code generation and display explanation', async ({ page }) => {
    // 1. Switch to manual input mode
    const manualModeButton = page.locator('button[title="Manual"]');
    await manualModeButton.click();

    // 2. Fill the prompt and generate code
    const promptInput = page.locator('textarea[placeholder*="Descreva o componente"]');
    await promptInput.fill('Crie um botão simples azul');
    
    const generateButton = page.getByRole('button', { name: /Gerar componente/i });
    await generateButton.click();

    // 3. Wait for code to be generated (Code2 icon indicates source code card is ready)
    const sourceCodeTitle = page.getByText('Código Fonte');
    await expect(sourceCodeTitle).toBeVisible({ timeout: 30000 });

    // 4. Verify "Me Explique" button is visible
    const explainButton = page.getByRole('button', { name: /Me Explique/i });
    await expect(explainButton).toBeVisible();

    // 5. Click "Me Explique" and check for loading state
    await explainButton.click();
    const explainingButton = page.getByRole('button', { name: /Explicando/i });
    await expect(explainingButton).toBeVisible();

    // 6. Verify Explanation Sidebar appears
    const explanationTitle = page.getByText('Explicação do Tutor');
    await expect(explanationTitle).toBeVisible({ timeout: 30000 });

    // 7. Verify some content inside the explanation (Markdown rendering)
    const explanationContent = page.locator('.prose');
    await expect(explanationContent).toBeVisible();

    // 8. Close the sidebar
    const closeButton = page.locator('button').filter({ has: page.locator('svg.lucide-x') });
    await closeButton.click();
    await expect(explanationTitle).not.toBeVisible();
  });
});

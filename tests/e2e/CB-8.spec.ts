import { test, expect } from '@playwright/test';

test.describe('Responsive Preview Toolbar (CB-8)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should toggle between different resolutions', async ({ page }) => {
    // 1. Check if Toolbar exists in Preview card header
    const previewHeader = page.locator('div:has-text("Preview")').first();
    const toolbar = page.locator('div:has(button[title="Mobile (375px)"])').first();
    await expect(toolbar).toBeVisible();

    // 2. Generate some code to show the sandbox
    const manualModeButton = page.locator('button[title="Manual"]');
    await manualModeButton.click();
    const promptInput = page.locator('textarea[placeholder*="Descreva o componente"]');
    await promptInput.fill('Crie um card simples');
    await page.getByRole('button', { name: /Gerar componente/i }).click();

    // Wait for code generation and sandbox to appear
    const sandbox = page.locator('iframe[title="Preview Sandbox"]');
    await expect(sandbox).toBeVisible({ timeout: 30000 });

    // The iframe is inside a container that we resize
    const sandboxContainer = page.locator('div.h-full.bg-white.shadow-sm.transition-all');

    // 3. Test Mobile (375px)
    const mobileButton = page.locator('button[title="Mobile (375px)"]');
    await mobileButton.click();
    await expect(sandboxContainer).toHaveCSS('width', '375px');
    await expect(page.getByText('375px')).toBeVisible();

    // 4. Test Tablet (768px)
    const tabletButton = page.locator('button[title="Tablet (768px)"]');
    await tabletButton.click();
    await expect(sandboxContainer).toHaveCSS('width', '768px');
    await expect(page.getByText('768px')).toBeVisible();

    // 5. Test Laptop (1024px)
    const laptopButton = page.locator('button[title="Laptop (1024px)"]');
    await laptopButton.click();
    await expect(sandboxContainer).toHaveCSS('width', '1024px');
    await expect(page.getByText('1024px')).toBeVisible();

    // 6. Test Desktop (Full)
    const desktopButton = page.locator('button[title="Desktop (Full)"]');
    await desktopButton.click();
    // For "100%", we check if it takes the full width of its parent
    const parentWidth = await page.locator('div.relative.w-full.h-full.min-h-\\[400px\\]').evaluate(el => el.clientWidth);
    const containerWidth = await sandboxContainer.evaluate(el => el.clientWidth);
    expect(containerWidth).toBe(parentWidth);
    await expect(page.getByText('Full')).toBeVisible();
  });
});

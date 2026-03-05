import { test, expect } from '@playwright/test';

test.describe('CB-1: Implementação de Design Pattern', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('deve exibir os elementos principais da nova interface', async ({ page }) => {
    await test.step('Verificar Navbar e Logo', async () => {
      await expect(page.getByText('codaí voice')).toBeVisible();
      await expect(page.getByRole('link', { name: 'Studio' })).toBeVisible();
    });

    await test.step('Verificar Título Principal', async () => {
      await expect(page.getByRole('heading', { name: 'Studio Studio' })).toBeVisible();
    });

    await test.step('Verificar Card de Comando de Voz', async () => {
      await expect(page.getByText('Comando de Voz')).toBeVisible();
      // O VoiceInput deve estar presente
      await expect(page.locator('button:has-text("Falar")')).toBeVisible();
    });

    await test.step('Verificar Card de Código Fonte', async () => {
      await expect(page.getByText('Código Fonte')).toBeVisible();
      await expect(page.getByText('// Fale para gerar o código...')).toBeVisible();
    });

    await test.step('Verificar Card de Preview', async () => {
      await expect(page.getByText('Preview')).toBeVisible();
      await expect(page.getByText('O preview aparecerá aqui')).toBeVisible();
    });

    await test.step('Verificar Footer', async () => {
      await expect(page.getByText('Codaí Voice', { exact: true })).toBeVisible();
      await expect(page.getByText('Experimento pessoal © 2026')).toBeVisible();
    });
  });

  test('deve ser responsivo (mobile)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await expect(page.getByText('codaí voice')).toBeVisible();
    // O menu de navegação pode mudar ou ser escondido dependendo da implementação mobile
    // Mas o Studio Studio deve continuar visível
    await expect(page.getByRole('heading', { name: 'Studio Studio' })).toBeVisible();
  });
});

import { test, expect } from '@playwright/test';

test.describe('CB-3: Implementar Campo Manual de Prompt', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('deve alternar entre modo voz e modo manual', async ({ page }) => {
    await test.step('Verificar modo voz inicial', async () => {
      await expect(page.getByText('Comando de Voz')).toBeVisible();
      // O botão VoiceInput tem um span com o texto "Falar"
      await expect(page.locator('button:has-text("Falar")')).toBeVisible();
    });

    await test.step('Alternar para modo manual', async () => {
      await page.getByTitle('Manual').click();
      await expect(page.getByText('Prompt Manual')).toBeVisible();
      await expect(page.getByPlaceholder('Descreva o componente que você deseja criar...')).toBeVisible();
      await expect(page.locator('button:has-text("Gerar componente")')).toBeVisible();
    });

    await test.step('Alternar de volta para modo voz', async () => {
      await page.getByTitle('Voz').click();
      await expect(page.getByText('Comando de Voz')).toBeVisible();
      await expect(page.locator('button:has-text("Falar")')).toBeVisible();
    });
  });

  test('deve validar o limite de caracteres e prompt vazio', async ({ page }) => {
    await page.getByTitle('Manual').click();
    const textarea = page.getByPlaceholder('Descreva o componente que você deseja criar...');
    const submitBtn = page.locator('button:has-text("Gerar componente")');

    await test.step('Verificar botão desabilitado para prompt vazio', async () => {
      await expect(submitBtn).toBeDisabled();
    });

    await test.step('Verificar contador de caracteres', async () => {
      await expect(page.getByText('0/500')).toBeVisible();
      await textarea.fill('Teste de componente');
      await expect(page.getByText('19/500')).toBeVisible();
      await expect(submitBtn).toBeEnabled();
    });

    await test.step('Verificar limite de 500 caracteres', async () => {
      const longText = 'a'.repeat(600);
      await textarea.type(longText);
      const value = await textarea.inputValue();
      expect(value.length).toBe(500);
      await expect(page.getByText('500/500')).toBeVisible();
    });
  });

  test('deve disparar a geração ao clicar no botão', async ({ page }) => {
    // Mock da API para evitar chamadas reais durante o teste
    await page.route('**/api/generate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ component: '<div id="generated-test">Componente Gerado</div>' }),
      });
    });

    await page.getByTitle('Manual').click();
    await page.getByPlaceholder('Descreva o componente que você deseja criar...').fill('Crie um botão azul');
    await page.locator('button:has-text("Gerar componente")').click();

    await test.step('Verificar se o código foi gerado e exibido', async () => {
      await expect(page.locator('code')).toContainText('Componente Gerado', { timeout: 15000 });
    });

    await test.step('Verificar se o preview foi atualizado', async () => {
      // O preview usa dangerouslySetInnerHTML em uma div dentro de um CardContent
      await expect(page.locator('#generated-test')).toBeVisible({ timeout: 10000 });
    });
  });
});

import { test, expect } from '@playwright/test';

test.describe('CB-3: Implementar Campo Manual de Prompt', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('deve alternar entre modo voz e modo manual', async ({ page }) => {
    await test.step('Verificar modo voz inicial', async () => {
      await expect(page.getByRole('heading', { name: 'Comando de Voz' })).toBeVisible();
      // O botão VoiceInput tem um span com o texto "Falar"
      await expect(page.locator('button:has-text("Falar")')).toBeVisible();
    });

    await test.step('Alternar para modo manual', async () => {
      await page.getByTitle('Manual').click();
      await expect(page.getByRole('heading', { name: 'Prompt Manual' })).toBeVisible();
      await expect(page.getByPlaceholder('Descreva o componente que você deseja criar...')).toBeVisible();
      await expect(page.locator('button:has-text("Gerar componente")').first()).toBeVisible();
    });

    await test.step('Alternar de volta para modo voz', async () => {
      await page.getByTitle('Voz').click();
      await expect(page.getByRole('heading', { name: 'Comando de Voz' })).toBeVisible();
      await expect(page.locator('button:has-text("Falar")')).toBeVisible();
    });
  });

  test('deve validar o limite de caracteres e prompt vazio', async ({ page }) => {
    await page.getByTitle('Manual').click();
    const textarea = page.getByPlaceholder('Descreva o componente que você deseja criar...');
    const submitBtn = page.locator('button:has-text("Gerar componente")').first();

    await test.step('Verificar botão desabilitado para prompt vazio', async () => {
      await expect(submitBtn).toBeDisabled();
    });

    await test.step('Verificar contador de caracteres', async () => {
      // Usamos getByText com exact: true para evitar conflitos com "/500 caracteres"
      await expect(page.getByText('0/500', { exact: true })).toBeVisible();
      await textarea.fill('Teste de componente');
      await expect(page.getByText('19/500', { exact: true })).toBeVisible();
      await expect(submitBtn).toBeEnabled();
    });

    await test.step('Verificar limite de 500 caracteres', async () => {
      const longText = 'a'.repeat(600);
      await textarea.type(longText);
      const value = await textarea.inputValue();
      expect(value.length).toBe(500);
      await expect(page.getByText('500/500', { exact: true })).toBeVisible();
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
    await page.locator('button:has-text("Gerar componente")').first().click();

    await test.step('Verificar se o código foi gerado e exibido', async () => {
      await expect(page.locator('code')).toContainText('Componente Gerado', { timeout: 15000 });
    });

    await test.step('Verificar se the preview foi atualizado', async () => {
      // O preview usa dangerouslySetInnerHTML em uma div dentro de um CardContent
      await expect(page.locator('#generated-test')).toBeVisible({ timeout: 10000 });
    });
  });

  test('deve exibir erro quando a API falha', async ({ page }) => {
    // Mock da API para simular erro
    await page.route('**/api/generate', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Erro ao gerar código.' }),
      });
    });

    await page.getByTitle('Manual').click();
    await page.getByPlaceholder('Descreva o componente que você deseja criar...').fill('Crie algo impossível');
    await page.locator('button:has-text("Gerar componente")').first().click();

    await test.step('Verificar se a mensagem de erro é exibida', async () => {
      // Usamos um seletor mais específico para o alerta de erro
      const errorAlert = page.locator('div[role="alert"]').filter({ hasText: 'Ops! Algo deu errado' });
      await expect(errorAlert).toBeVisible();
      await expect(errorAlert).toContainText('Erro ao gerar código.');
    });
  });
});

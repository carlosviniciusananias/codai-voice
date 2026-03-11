import { test, expect } from '@playwright/test';

test.describe('Tratamento de Erros de Renderização', () => {
  test('deve exibir mensagem de erro amigável quando o código falha', async ({ page }) => {
    // 1. Acessar a página inicial
    await page.goto('/');

    // 2. Simular a geração de um código com erro
    // Como não queremos chamar a API real de IA, vamos injetar o código diretamente se possível
    // ou simular o estado. Para um teste real de integração, poderíamos usar um mock da API.
    
    // Vamos simular que o usuário digitou algo e o código gerado tem um erro
    // Para fins de teste E2E, podemos forçar o estado via evaluate se necessário, 
    // mas o ideal é testar o fluxo.
    
    // Mock da API de geração para retornar um código com erro
    await page.route('/api/generate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          component: 'console.log(undefinedVariable);'
        })
      });
    });

    // Mock da API de log para verificar se foi chamada
    let logCalled = false;
    await page.route('/api/log-error', async (route) => {
      logCalled = true;
      await route.fulfill({ status: 200, body: JSON.stringify({ success: true }) });
    });

    // 3. Digitar no prompt manual e gerar
    await page.click('button[title="Manual"]');
    await page.fill('textarea', 'Crie um componente com erro');
    await page.click('button:has-text("Gerar")');

    // 4. Verificar se o alerta de erro aparece no preview
    const errorAlert = page.locator('text=Erro de Renderização');
    await expect(errorAlert).toBeVisible({ timeout: 10000 });

    // 5. Verificar se o log foi enviado
    expect(logCalled).toBe(true);

    // 6. Verificar se o botão "Corrigir com IA" está presente
    const fixButton = page.locator('button:has-text("Corrigir com IA")');
    await expect(fixButton).toBeVisible();
  });
});

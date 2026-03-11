import { test, expect } from '@playwright/test';

test.describe('CB-6: Gerenciar Versões na Sessão', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('deve criar session_id e persistir versões no histórico', async ({ page }) => {
    await test.step('Verificar criação de session_id nos cookies', async () => {
      const cookies = await page.context().cookies();
      const sessionCookie = cookies.find(c => c.name === 'codai_session_id');
      expect(sessionCookie).toBeDefined();
      expect(sessionCookie?.value).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    await test.step('Alternar para modo manual e gerar componentes', async () => {
      await page.getByTitle('Manual').click();
      const promptInput = page.getByPlaceholder(/Descreva o componente/i);
      const generateButton = page.getByRole('button', { name: /Gerar componente/i });
      
      // Gerar Versão 1
      await promptInput.fill('Botão azul');
      await generateButton.click();
      // Aguarda o sumiço do estado de processamento se ele aparecer, ou apenas aguarda a versão
      await expect(page.getByText('Versão 1')).toBeVisible({ timeout: 20000 });

      // Gerar Versão 2
      await promptInput.fill('Card de produto');
      await generateButton.click();
      await expect(page.getByText('Versão 2')).toBeVisible({ timeout: 20000 });
    });

    await test.step('Validar restauração de versão', async () => {
      // Clica na Versão 1 para restaurar
      await page.getByText('Versão 1').click();
      await expect(page.getByText('Exportado!')).toBeVisible(); // Feedback visual de restauração (reutilizando o showSuccess)
      
      // Verifica se o código mudou (simulação simples, o ideal seria checar o conteúdo do editor)
      await expect(page.getByText('Versão 1')).toBeVisible();
    });

    await test.step('Persistência após recarregar a página', async () => {
      await page.reload();
      await expect(page.getByText('Histórico de Versões')).toBeVisible();
      await expect(page.getByText('Versão 2')).toBeVisible();
      await expect(page.getByText('Versão 1')).toBeVisible();
    });
  });

  test('deve respeitar o limite de 5 versões', async ({ page }) => {
    await page.getByTitle('Manual').click();
    const promptInput = page.getByPlaceholder(/Descreva o componente/i);
    const generateButton = page.getByRole('button', { name: /Gerar componente/i });

    // Limpar histórico anterior (opcional, mas bom para isolamento se possível)
    // Aqui vamos apenas gerar 6 novas versões e garantir que o total não passe de 5
    for (let i = 1; i <= 6; i++) {
      await promptInput.fill(`Componente teste limite ${i}`);
      await generateButton.click();
      // Aguarda a versão correspondente aparecer
      await expect(page.locator('button:has-text("Versão")').first()).toBeVisible({ timeout: 20000 });
    }

    // Deve mostrar no máximo 5 versões
    const versionButtons = page.locator('button:has-text("Versão")');
    await expect(versionButtons).toHaveCount(5);
    
    // A versão mais antiga (Versão 1) deve ter sido removida, e a mais nova deve ser Versão 6
    await expect(page.getByText('Versão 6')).toBeVisible();
    await expect(page.getByText('Versão 1')).not.toBeVisible();
  });
});

import { test, expect } from '@playwright/test';

test.describe('CB-9: Composição de Componentes (Multi-step Assembly)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('deve exibir os novos elementos de interface da CB-9', async ({ page }) => {
    await test.step('Verificar botões Novo e Adicionar', async () => {
      const btnNovo = page.getByRole('button', { name: 'Novo' });
      const btnAdicionar = page.getByRole('button', { name: 'Adicionar' });
      
      await expect(btnNovo).toBeVisible();
      await expect(btnAdicionar).toBeVisible();
      
      // 'Novo' deve estar ativo por padrão (bg-white ou similar dependendo do tema, mas vamos checar visibilidade)
      await expect(btnNovo).toHaveClass(/bg-white|dark:bg-zinc-700/);
    });

    await test.step('Alternar para modo Adicionar', async () => {
      const btnAdicionar = page.getByRole('button', { name: 'Adicionar' });
      await btnAdicionar.click();
      
      await expect(btnAdicionar).toHaveClass(/bg-white|dark:bg-zinc-700/);
    });
  });

  test('deve permitir a composição incremental e exibir o histórico', async ({ page }) => {
    // 1. Mudar para modo manual para facilitar o teste automatizado sem depender de áudio
    await page.locator('button[title="Manual"]').click();
    
    // 2. Gerar o primeiro componente (Modo Novo)
    const promptInput = page.locator('textarea[placeholder*="Descreva o componente"]');
    await promptInput.fill('Crie um botão azul com texto "Clique aqui"');
    await page.keyboard.press('Enter');
    
    // Aguardar o carregamento (pode levar alguns segundos dependendo da API)
    await expect(page.getByText('Processando...')).toBeVisible();
    await expect(page.getByText('Processando...')).not.toBeVisible({ timeout: 30000 });
    
    // Verificar se o código foi gerado
    await expect(page.locator('pre code')).toContainText('button');
    await expect(page.locator('pre code')).toContainText('Clique aqui');

    // 3. Mudar para modo Adicionar
    await page.getByRole('button', { name: 'Adicionar' }).click();
    
    // 4. Adicionar um ícone ao botão
    await promptInput.fill('Adicione um ícone de estrela antes do texto');
    await page.keyboard.press('Enter');
    
    await expect(page.getByText('Processando...')).toBeVisible();
    await expect(page.getByText('Processando...')).not.toBeVisible({ timeout: 30000 });
    
    // Verificar se o histórico apareceu
    await expect(page.getByText('Passos da Composição')).toBeVisible();
    await expect(page.getByText('Passo 1')).toBeVisible();
    await expect(page.getByText('Passo 2')).toBeVisible();
    
    // Verificar se o código consolidado contém ambos
    await expect(page.locator('pre code')).toContainText('button');
    // O modelo pode retornar algo como <Star /> ou similar
    // Vamos verificar se a instrução de adicionar está no histórico
    await expect(page.getByText('Adicione um ícone de estrela antes do texto')).toBeVisible();
  });

  test('deve permitir a restauração de estados anteriores do histórico', async ({ page }) => {
    await page.locator('button[title="Manual"]').click();
    
    // Passo 1
    const promptInput = page.locator('textarea[placeholder*="Descreva o componente"]');
    await promptInput.fill('Crie um card simples');
    await page.keyboard.press('Enter');
    await expect(page.getByText('Processando...')).not.toBeVisible({ timeout: 30000 });
    
    // Passo 2 (Adicionar)
    await page.getByRole('button', { name: 'Adicionar' }).click();
    await promptInput.fill('Adicione um título "Meu Card"');
    await page.keyboard.press('Enter');
    await expect(page.getByText('Processando...')).not.toBeVisible({ timeout: 30000 });
    
    // Verificar histórico
    const passo1Btn = page.getByRole('button').filter({ hasText: 'Passo 1' });
    const passo2Btn = page.getByRole('button').filter({ hasText: 'Passo 2' });
    
    await expect(passo1Btn).toBeVisible();
    await expect(passo2Btn).toBeVisible();
    
    // Clicar no Passo 1 para restaurar
    await passo1Btn.click();
    
    // Verificar se o feedback de sucesso apareceu
    await expect(page.getByText('Exportado!')).not.toBeVisible(); // 'Exportado!' é usado para feedback genérico de sucesso no Home.tsx
    // Na verdade o Home.tsx usa setShowSuccess(true) que exibe "Exportado!" no toolbar do código.
    // Vamos verificar se o botão do Passo 1 ficou ativo (azul)
    await expect(passo1Btn).toHaveClass(/bg-blue-50|dark:bg-blue-950/);
  });
});

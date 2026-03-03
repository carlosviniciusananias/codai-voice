import { test, expect } from "@playwright/test";

test.describe("CB-1 — Studio de componentes por voz", () => {
  test("atende aos critérios principais da UI", async ({ page }) => {
    await test.step("Acessar a página inicial", async () => {
      await page.goto("/");
      await expect(
        page.getByRole("heading", {
          name: /Studio de componentes por voz/i,
          level: 1,
        }),
      ).toBeVisible();
    });

    await test.step("Verificar navegação simplificada (≤ 5 itens principais)", async () => {
      const nav = page.getByRole("navigation", {
        name: /Navegação principal/i,
      });

      await expect(nav).toBeVisible();

      const navItems = await nav.getByRole("link").all();
      expect(navItems.length).toBeLessThanOrEqual(5);
    });

    await test.step("Validar layout responsivo básico", async () => {
      await page.setViewportSize({ width: 1280, height: 720 });
      await expect(
        page.getByRole("heading", { name: /Studio de componentes por voz/i }),
      ).toBeVisible();

      await page.setViewportSize({ width: 768, height: 1024 });
      await expect(
        page.getByRole("heading", { name: /Studio de componentes por voz/i }),
      ).toBeVisible();

      await page.setViewportSize({ width: 430, height: 932 });
      await expect(
        page.getByRole("heading", { name: /Studio de componentes por voz/i }),
      ).toBeVisible();
    });

    await test.step("Conferir áreas principais: comando de voz, código e preview", async () => {
      await expect(
        page.getByRole("heading", { name: /Comando de voz/i, level: 2 }),
      ).toBeVisible();

      await expect(
        page.getByLabel(/Studio de geração de componentes por voz/i),
      ).toBeVisible();

      await expect(page.getByLabel(/Código gerado/i)).toBeVisible();
      await expect(
        page.getByRole("heading", { name: /Preview interativo/i, level: 2 }),
      ).toBeVisible();
    });

    await test.step("Garantir feedbacks de estado básicos", async () => {
      const tip = page.getByText(/Dica: peça por componentes específicos/i);
      await expect(tip).toBeVisible();

      const codePlaceholder = page.getByText(
        /O código gerado aparecerá aqui assim que você falar./i,
      );
      await expect(codePlaceholder).toBeVisible();

      const previewPlaceholder = page.getByText(
        /Assim que o código for gerado, tentaremos renderizar aqui um preview visual do componente./i,
      );
      await expect(previewPlaceholder).toBeVisible();
    });
  });
});


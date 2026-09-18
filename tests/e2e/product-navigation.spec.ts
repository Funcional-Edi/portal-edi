import { expect, test, type Page } from "@playwright/test";

async function login(page: Page, admin = false) {
  await page.goto("/");
  const dev = page.getByRole("tab", { name: "Login local (dev)" });
  if (await dev.count()) await dev.click();
  await page.getByLabel("E-mail").fill(admin ? "admin@funcionalcorp.com.br" : "qa-distribuidor@fidelize.com.br");
  await page.getByRole("button", { name: "Entrar (dev)" }).click();
  await expect(page.getByRole("button", { name: "Sair" })).toBeVisible();
  await page.goto("/docs");
}

test("one vertical navbar changes from products to product and integration context", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await login(page);
  const nav = page.getByRole("navigation", { name: "Produtos EDI" });

  for (const label of ["Credenciado", "Movimentação de Vidas", "Trade", "APS", "PBM", "Documentação (Clientes)"]) {
    await expect(nav.getByText(label, { exact: true })).toBeVisible();
  }
  await expect(nav.getByRole("button", { name: "Queries", exact: true })).toHaveCount(0);
  await expect(nav.getByRole("button", { name: "Mutations", exact: true })).toHaveCount(0);

  await nav.getByRole("link", { name: "Trade", exact: true }).click();
  await expect(page).toHaveURL("/docs?produto=trade");
  await expect(page.getByRole("heading", { name: "Trade", exact: true })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Credenciado", exact: true })).toHaveCount(0);
  await expect(nav.getByRole("link", { name: "Produtos", exact: true })).toBeVisible();
  await expect(nav.getByRole("link", { name: /^Canal Autorizador/ })).toHaveAttribute("href", "/docs/canal-autorizador");
  await expect(nav.getByRole("link", { name: /^Wholesaler/ })).toHaveAttribute("href", "/docs/wholesaler");
  await expect(nav.getByRole("link", { name: /^IM/ })).toHaveAttribute("href", "/docs/im");
  await expect(nav.getByRole("button", { name: /^EDI Redes/ })).toBeDisabled();

  await nav.getByRole("link", { name: /^Canal Autorizador/ }).click();
  await expect(page.getByRole("heading", { name: "Canal Autorizador", exact: true })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Trade", exact: true })).toHaveAttribute("href", "/docs?produto=trade");
  const documentation = nav.getByRole("link", { name: "Documentação", exact: true }).last();
  await expect(documentation).toHaveAttribute("href", "/docs/canal-autorizador");
  await expect(nav.getByRole("button", { name: "Queries", exact: true })).toBeVisible();
  await expect(nav.getByRole("button", { name: "Mutations", exact: true })).toBeVisible();
  await expect(nav.getByRole("button", { name: "Métodos", exact: true })).toHaveCount(0);
  await expect(nav.getByRole("link", { name: "Teste de Requisição", exact: true })).toHaveCount(0);
  await expect(page).toHaveURL("/docs/canal-autorizador");
  await expect(page.getByText("Seu ponto de partida", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Índice", { exact: true })).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL("/docs?produto=trade");
  await nav.getByRole("link", { name: /^Wholesaler/ }).click();
  await expect(page).toHaveURL("/docs/wholesaler");
  await nav.getByRole("link", { name: "Trade", exact: true }).click();
  await expect(page).toHaveURL("/docs?produto=trade");
  await nav.getByRole("link", { name: /^IM/ }).click();
  await expect(page).toHaveURL("/docs/im");
  await page.goBack();
  await expect(page).toHaveURL("/docs?produto=trade");
  await nav.getByRole("link", { name: "Produtos", exact: true }).click();
  await expect(page).toHaveURL("/docs");
  await expect(page.getByText("Seu ponto de partida", { exact: true })).toBeVisible();

  const navBox = await nav.boundingBox();
  const contentBox = await page.getByRole("region", { name: "Conteúdo da documentação" }).boundingBox();
  expect(navBox!.x + navBox!.width).toBeLessThan(contentBox!.x);
  await page.screenshot({ path: testInfo.outputPath("docs-contextual-desktop.png"), fullPage: true });
});

test("mobile navigation preserves context without horizontal overflow", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  const nav = page.getByRole("navigation", { name: "Produtos EDI" });
  const menu = page.getByRole("button", { name: "Mostrar produtos" });

  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await menu.click();
  await nav.getByRole("link", { name: "Trade", exact: true }).click();
  await nav.getByRole("link", { name: /^IM/ }).click();
  await expect(page.getByRole("heading", { name: "IM", exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("docs-contextual-mobile.png"), fullPage: true });
});

test("admins can reach the existing request test from a selected flow", async ({ page }) => {
  await login(page, true);
  const nav = page.getByRole("navigation", { name: "Produtos EDI" });
  await nav.getByRole("link", { name: "Trade", exact: true }).click();
  await nav.getByRole("link", { name: /^IM/ }).click();
  const requestTest = nav.getByRole("link", { name: "Teste de Requisição", exact: true });
  await expect(requestTest).toHaveAttribute("href", "/docs/im/playground");
  await requestTest.click();
  await expect(page).toHaveURL("/docs/im/playground");
});

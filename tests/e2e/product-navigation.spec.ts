import { expect, test, type Page } from "@playwright/test";

async function login(page: Page, admin = false) {
  await page.goto("/");
  const dev = page.getByRole("tab", { name: "Login local (dev)" });
  if (await dev.count()) await dev.click();
  await page.getByLabel("E-mail").fill(admin ? "admin@funcionalcorp.com.br" : "qa@distribuidor.com");
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
  await expect(nav.getByRole("link", { name: "Voltar aos produtos", exact: true })).toHaveAttribute("href", "/docs");
  const documentation = nav.getByRole("link", { name: "Documentação", exact: true }).last();
  await expect(documentation).toHaveAttribute("href", "/docs/canal-autorizador");
  await expect(nav.getByRole("button", { name: "Queries", exact: true })).toBeVisible();
  await expect(nav.getByRole("button", { name: "Mutations", exact: true })).toBeVisible();
  await expect(nav.getByRole("button", { name: "Métodos", exact: true })).toHaveCount(0);
  await expect(nav.getByRole("link", { name: "Teste de Requisição", exact: true })).toHaveCount(0);
  await expect(page).toHaveURL("/docs/canal-autorizador");
  await expect(page.getByText("Seu ponto de partida", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Índice", { exact: true })).toBeVisible();
  const homologation = nav.getByRole("link", { name: "Roteiro de Homologação", exact: true });
  await homologation.click();
  await expect(page).toHaveURL("/docs/canal-autorizador#roteiro-integracao");
  await expect(homologation).toHaveAttribute("aria-current", "page");

  await page.goBack();
  await expect(page).toHaveURL("/docs?produto=trade");
  await nav.getByRole("link", { name: /^Wholesaler/ }).click();
  await expect(page).toHaveURL("/docs/wholesaler");
  await nav.getByRole("link", { name: "Voltar aos produtos", exact: true }).click();
  await expect(page).toHaveURL("/docs");
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

test("published product shows the complete flowchart and homologation manual", async ({ page }) => {
  await login(page);
  const nav = page.getByRole("navigation", { name: "Produtos EDI" });

  await nav.getByRole("link", { name: "Movimentação de Vidas", exact: true }).click();
  await expect(page).toHaveURL("/docs?produto=movimentacao-de-vidas");
  await nav.getByRole("button", { name: "Fluxograma Completo", exact: true }).click();
  const flowchartLink = page.locator('a[href="/fluxogramas/movimentacao-de-vidas"]');
  await expect(flowchartLink).toHaveCount(1);
  await flowchartLink.click();
  await expect(page).toHaveURL("/fluxogramas/movimentacao-de-vidas");
  await expect(page.getByRole("heading", { name: "Fluxo de Movimentação de Vidas" })).toBeVisible();
});

test("long subproduct pages expose a scroll-to-top control", async ({ page }) => {
  await login(page);
  await page.goto("/docs/canal-autorizador");
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

  const scrollTop = page.getByRole("button", { name: "Voltar ao topo" });
  await expect(scrollTop).toBeVisible();
  await scrollTop.click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(100);
});

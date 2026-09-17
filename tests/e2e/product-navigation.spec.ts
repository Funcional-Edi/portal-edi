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

test("vertical navbar exposes products, confirmed links and keyboard-accessible placeholders", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await login(page);
  const nav = page.getByRole("navigation", { name: "Produtos EDI" });
  for (const label of ["Credenciado", "Movimentação de Vidas", "Trade", "APS", "PBM"]) {
    await expect(nav.getByRole("button", { name: new RegExp(`^${label}`) })).toBeVisible();
  }
  await expect(nav.getByText("Documentação (Clientes)", { exact: true })).toHaveCount(0);
  const credenciado = nav.getByRole("button", { name: /^Credenciado/ });
  await credenciado.focus();
  await page.keyboard.press("Enter");
  await expect(credenciado).toHaveAttribute("aria-expanded", "true");
  await expect(nav.getByText("Fluxo de Cadastro", { exact: true }).locator("..")).toHaveAttribute("aria-disabled", "true");
  await page.keyboard.press("Space");
  await expect(credenciado).toHaveAttribute("aria-expanded", "false");
  await nav.getByRole("button", { name: "Trade", exact: true }).click();
  await expect(nav.getByRole("link", { name: /^Canal Autorizador/ })).toHaveAttribute("href", "/docs/canal-autorizador");
  await expect(nav.getByRole("link", { name: /^Wholesaler/ })).toHaveAttribute("href", "/docs/wholesaler");
  await expect(nav.getByRole("link", { name: /^IM homolog/ })).toHaveAttribute("href", "/docs/im");
  await expect(nav.getByRole("link", { name: /EDI Redes/ })).toHaveCount(0);
  await expect(nav.getByRole("button", { name: "Teste de Requisição" })).toHaveCount(0);
  const navBox = await nav.boundingBox();
  const mainBox = await page.getByRole("main").boundingBox();
  expect(navBox!.x + navBox!.width).toBeLessThan(mainBox!.x);
  await page.screenshot({ path: testInfo.outputPath("docs-desktop.png"), fullPage: true });
  await nav.getByRole("link", { name: /^IM homolog/ }).click();
  await expect(page).toHaveURL("/docs/im");
  await expect(nav.getByRole("link", { name: /^IM homolog/ })).toHaveAttribute("aria-current", "page");
  await expect(nav.getByRole("button", { name: "Trade", exact: true })).toHaveAttribute("aria-current", "location");
  await nav.getByRole("button", { name: "Roteiro", exact: true }).click();
  await nav.getByRole("link", { name: /^IM homolog/ }).click();
  await expect(page).toHaveURL("/docs/im#roteiro-integracao");
  await expect(nav.getByRole("button", { name: "Roteiro", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.goto("/docs/im/operations/mutation/createToken");
  await expect(nav.getByRole("button", { name: "Roteiro", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.goto("/docs/api/im");
  await expect(nav.getByRole("button", { name: "Documentação", exact: true })).toHaveAttribute("aria-pressed", "true");
});

test("mobile navbar expands, collapses and navigates without horizontal overflow", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  const nav = page.getByRole("navigation", { name: "Produtos EDI" });
  const menu = nav.getByRole("button", { name: "Mostrar produtos" });
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await menu.click();
  await nav.getByRole("button", { name: "Trade", exact: true }).click();
  await page.screenshot({ path: testInfo.outputPath("docs-mobile.png"), fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await nav.getByRole("link", { name: /^IM homolog/ }).click();
  await expect(page).toHaveURL("/docs/im");
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await menu.click();
  await expect(nav.getByRole("link", { name: /^IM homolog/ })).toHaveAttribute("aria-current", "page");
});

test("admin navigation reuses the existing request test route", async ({ page }) => {
  await login(page, true);
  const nav = page.getByRole("navigation", { name: "Produtos EDI" });
  await nav.getByRole("button", { name: "Trade", exact: true }).click();
  await nav.getByRole("button", { name: "Teste de Requisição", exact: true }).click();
  await nav.getByRole("link", { name: /^IM homolog/ }).click();
  await expect(page).toHaveURL("/docs/im/playground");
  await expect(page.locator("#playground-query")).toBeVisible();
  await expect(nav.getByRole("button", { name: "Teste de Requisição", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("link", { name: /playground/i })).toHaveCount(0);
});

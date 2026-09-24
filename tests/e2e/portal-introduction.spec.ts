import { expect, test, type Page } from "@playwright/test";

async function login(page: Page, admin = false) {
  await page.goto("/");
  const devTab = page.getByRole("tab", { name: "Login local (dev)" });
  if (await devTab.count()) await devTab.click();
  await page.getByLabel("E-mail").fill(admin ? "admin@funcionalcorp.com.br" : "qa@distribuidor.com");
  await page.getByRole("button", { name: "Entrar (dev)" }).click();
  await expect(page.getByRole("button", { name: "Sair" })).toBeVisible();
}

test("guest sees a focused login and documentation still requires a session", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Portal de Integração", exact: true })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Entre para continuar" })).toBeVisible();
  await expect(page.getByText("Fluxos de integração", { exact: true })).toHaveCount(0);
  await expect(page.getByLabel(/^Tipo de acesso:/)).toHaveCount(0);
  await expect(page.getByText(/Para clientes, fornecedores e equipe EDI/)).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath("portal-login-desktop.png"), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("portal-login-mobile.png"), fullPage: true });
  await page.goto("/docs");
  await expect(page).toHaveURL(/callbackUrl=%2Fdocs/);
});

test("client uses the shared portal and documentation without gaining privileged access", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await login(page);
  await page.goto("/");
  const main = page.getByRole("main");
  await expect(page.getByRole("banner").getByLabel("Tipo de acesso: Cliente", { exact: true })).toBeVisible();
  await expect(page.getByText("Uma experiência compartilhada.", { exact: true })).toHaveCount(0);
  await expect(main.getByRole("heading", { name: "Recursos para sua integração" })).toBeVisible();
  await expect(main.getByRole("link", { name: /Documentação de produtos/ })).toHaveAttribute("href", "/docs");
  await expect(main.getByRole("link", { name: /Referência GraphQL/ })).toHaveAttribute("href", "/docs/api");
  await expect(main.getByRole("link", { name: /Fluxogramas/ })).toHaveAttribute("href", "/fluxogramas");
  await expect(page.locator('a[href^="/admin"], a[href^="/interno"], a[href^="/compliance"]')).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath("portal-home-desktop.png"), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByLabel("Tipo de acesso: Cliente", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("portal-home-mobile.png"), fullPage: true });
  await main.getByRole("link", { name: "Começar pela documentação" }).click();
  await expect(page).toHaveURL("/docs");
  await expect(page.getByRole("heading", { name: "Sua trilha de integração" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Antes de começar" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "O que você encontra por aqui" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Catálogos por família" })).toHaveCount(0);
  await expect(page.getByText("Documentação (Clientes)", { exact: true })).toBeHidden();
  await expect(page.getByRole("heading", { name: "Navegação compartilhada, acesso conforme seu perfil" })).toHaveCount(0);
  await expect(page.getByLabel("Tipo de acesso: Cliente", { exact: true })).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/docs?produto=trade");
  const nav = page.getByRole("navigation", { name: "Produtos EDI" });
  await expect(nav.getByRole("link", { name: /^IM/ })).toBeVisible();
  await expect(nav.getByRole("button", { name: "Teste de Requisição" })).toHaveCount(0);
  await page.goto("/admin/projects");
  await expect(page).toHaveURL("/docs");
  await page.goto("/interno");
  await expect(page).toHaveURL("/docs");
  const denied = await page.request.post("/api/living-docs/projects/im/graphql", { data: { query: "query { __typename }" } });
  expect(denied.status()).toBe(403);
});

test("admin retains project management and the shared documentation entry", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await login(page, true);
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Administração de projetos" })).toBeVisible();
  await expect(page.getByRole("banner").getByLabel("Tipo de acesso: Administrador", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Em evolução · equipe EDI" })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("portal-admin-desktop.png"), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByLabel("Tipo de acesso: Administrador", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("portal-admin-mobile.png"), fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole("link", { name: "Começar pela documentação" }).click();
  await expect(page).toHaveURL("/docs");
  const nav = page.getByRole("navigation", { name: "Produtos EDI" });
  await nav.getByRole("link", { name: "Trade", exact: true }).click();
  await nav.getByRole("link", { name: /^IM/ }).click();
  await expect(nav.getByRole("link", { name: "Teste de Requisição", exact: true })).toBeVisible();
});

test("logout clears the session and returns to the public home", async ({ page }) => {
  await login(page);
  await page.getByRole("button", { name: "Sair" }).click();
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("button", { name: "Entrar (dev)" })).toBeVisible();
  await page.goto("/docs");
  await expect(page).toHaveURL(/callbackUrl=%2Fdocs/);
});

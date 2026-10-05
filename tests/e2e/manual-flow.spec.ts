import { expect, test, type Page } from "@playwright/test";

async function loginAsDevUser(page: Page) {
  await page.goto("/");

  await page.getByLabel("E-mail").fill("qa@distribuidor.com");
  await page.getByRole("button", { name: "Entrar (dev)" }).click();

  await expect(page.getByRole("button", { name: "Sair" })).toBeVisible();
}

async function loginAsDevAdmin(page: Page) {
  await page.goto("/");
  await page.getByLabel("E-mail").fill("admin@funcionalcorp.com.br");
  await page.getByRole("button", { name: "Entrar (dev)" }).click();
  await expect(page.getByRole("button", { name: "Sair" })).toBeVisible();
}

test("produto na navbar para manual e operacao (demo)", async ({ page }) => {
  await loginAsDevUser(page);

  await page.goto("/docs/demo");
  await expect(page).toHaveURL("/docs/demo");
  await expect(page.getByRole("heading", { name: /Integração IM — Inventário \(demo\)/ })).toBeVisible();
  const index = page.locator("aside").last();
  await expect(index.getByRole("link", { name: "Contexto", exact: true })).toBeVisible();
  await expect(index.getByRole("link", { name: /1\. Obter token do gateway/ })).toHaveCount(0);

  const products = page.getByRole("navigation", { name: "Produtos EDI" });
  await products.getByRole("link", { name: "Jornada da Integração", exact: true }).click();
  await expect(
    index.getByRole("link", { name: /1\. Obter token do gateway/ }),
  ).toHaveClass(/ml-4/);

  await page
    .locator("#jornada-integracao")
    .getByRole("link", { name: /1\. Obter token do gateway/ })
    .click();

  await expect(page).toHaveURL("/docs/demo/operations/mutation/createToken");
  await expect(page.getByRole("heading", { name: "1. Obter token do gateway" })).toBeVisible();
  await expect(page.getByText("mutation createToken", { exact: false })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Consulte o Roteiro de Integração" })).toBeVisible();
  const integrationGuide = page.getByRole("link", { name: "Ver o Roteiro de Integração" });
  await expect(integrationGuide).toHaveAttribute(
    "href",
    "/docs/demo#roteiro-integracao",
  );
  await integrationGuide.click();
  await expect(page).toHaveURL("/docs/demo#roteiro-integracao");
  await expect(
    page.getByRole("navigation", { name: "Produtos EDI" }).getByRole("link", {
      name: "Roteiro de Integração",
      exact: true,
    }),
  ).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("heading", { name: "Detalhamento por fluxo" })).toBeVisible();
  await expect(page.getByText("Pré-requisitos", { exact: true })).toBeVisible();
});

test("/manual redireciona para /docs", async ({ page }) => {
  await loginAsDevUser(page);

  await page.goto("/manual/demo");
  await expect(page).toHaveURL("/docs/demo");
});

test("distribuidor nao ve link de Teste de Requisição", async ({ page }) => {
  await loginAsDevUser(page);

  await page.goto("/docs/demo/operations/mutation/createToken");
  await expect(page.getByRole("link", { name: "Teste de Requisição" })).toHaveCount(0);
  await expect(page.getByText(/disponível apenas para perfil admin/i)).toBeVisible();
});

test("admin abre playground com exemplo pre-preenchido", async ({ page }) => {
  await loginAsDevAdmin(page);

  await page.goto("/docs/demo/operations/mutation/createToken");
  await page.locator("article").getByRole("link", { name: "Teste de Requisição" }).click();
  await expect(page).toHaveURL(/\/docs\/demo\/playground\?query=/);
});

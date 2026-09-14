import { expect, test, type Page } from "@playwright/test";

async function loginAsDevUser(page: Page) {
  await page.goto("/");

  await page.getByLabel("E-mail").fill("qa-distribuidor@fidelize.com.br");
  await page.getByRole("button", { name: "Entrar (dev)" }).click();

  await expect(page.getByRole("button", { name: "Sair" })).toBeVisible();
}

async function loginAsDevAdmin(page: Page) {
  await page.goto("/");
  await page.getByLabel("E-mail").fill("admin@empresa.com");
  await page.getByRole("button", { name: "Entrar (dev)" }).click();
  await expect(page.getByRole("button", { name: "Sair" })).toBeVisible();
}

test("familia para produto para operacao (IM)", async ({ page }) => {
  await loginAsDevUser(page);

  await page.goto("/docs");
  await expect(page).toHaveURL("/docs");
  await expect(page.getByRole("heading", { name: "Documentação" })).toBeVisible();
  await page.getByRole("link", { name: /EDI Pharma/ }).click();

  await expect(page).toHaveURL("/docs/edi-pharma");
  await page.getByRole("link", { name: /IM - Inventario \(homolog\)/ }).click();

  await expect(page).toHaveURL("/docs/im");
  await expect(page.getByRole("heading", { name: "Integracao IM - Inventario" })).toBeVisible();

  await page
    .locator("#roteiro-integracao")
    .getByRole("link", { name: /1\. Obter token do gateway/ })
    .click();

  await expect(page).toHaveURL("/docs/im/operations/mutation/createToken");
  await expect(page.getByRole("heading", { name: "1. Obter token do gateway" })).toBeVisible();
  await expect(page.getByText("mutation createToken", { exact: false })).toBeVisible();
});

test("/manual redireciona para /docs", async ({ page }) => {
  await loginAsDevUser(page);

  await page.goto("/manual/im");
  await expect(page).toHaveURL("/docs/im");
});

test("distribuidor nao ve botao Testar no playground", async ({ page }) => {
  await loginAsDevUser(page);

  await page.goto("/docs/im/operations/mutation/createToken");
  await expect(page.getByRole("link", { name: "Testar no playground" })).toHaveCount(0);
  await expect(page.getByText(/disponível apenas para perfil admin/i)).toBeVisible();
});

test("admin abre playground com exemplo pre-preenchido", async ({ page }) => {
  await loginAsDevAdmin(page);

  await page.goto("/docs/im/operations/mutation/createToken");
  await page.getByRole("link", { name: "Testar no playground" }).click();
  await expect(page).toHaveURL(/\/docs\/im\/playground\?query=/);
  await expect(page.getByRole("heading", { name: "Integracao IM - Inventario" })).toBeVisible();
  await expect(page.locator("#playground-query")).toHaveValue(/mutation createToken/);
});

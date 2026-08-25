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

test("catalogo para roteiro para operacao (IM)", async ({ page }) => {
  await loginAsDevUser(page);

  await page.goto("/manual");
  await expect(page).toHaveURL("/manual");
  await expect(page.getByRole("heading", { name: "Manuais de integração" })).toBeVisible();
  await page.getByRole("link", { name: /IM - Inventario \(homolog\)/ }).click();

  await expect(page).toHaveURL("/manual/im");
  await expect(page.getByRole("heading", { name: "Integracao IM - Inventario" })).toBeVisible();

  await page
    .locator("#roteiro-integracao")
    .getByRole("link", { name: /1\. Obter token do gateway/ })
    .click();

  await expect(page).toHaveURL("/manual/im/operations/mutation/createToken");
  await expect(page.getByRole("heading", { name: "1. Obter token do gateway" })).toBeVisible();
  await expect(page.getByText("mutation createToken", { exact: false })).toBeVisible();
});

test("distribuidor nao ve botao Testar no playground", async ({ page }) => {
  await loginAsDevUser(page);

  await page.goto("/manual/im/operations/mutation/createToken");
  await expect(page.getByRole("link", { name: "Testar no playground" })).toHaveCount(0);
  await expect(page.getByText(/disponível apenas para perfil admin/i)).toBeVisible();
});

test("admin abre playground com exemplo pre-preenchido", async ({ page }) => {
  await loginAsDevAdmin(page);

  await page.goto("/manual/im/operations/mutation/createToken");
  await page.getByRole("link", { name: "Testar no playground" }).click();
  await expect(page).toHaveURL(/\/manual\/im\/playground\?query=/);
  await expect(page.getByRole("heading", { name: "Integracao IM - Inventario" })).toBeVisible();
  await expect(page.locator("#playground-query")).toHaveValue(/mutation createToken/);
});

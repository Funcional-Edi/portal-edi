import { expect, test, type Page } from "@playwright/test";

async function loginAsDevUser(page: Page) {
  await page.goto("/manual");
  await expect(page).toHaveURL(/\/login/);

  await page.getByLabel("E-mail").fill("qa-distribuidor@fidelize.com.br");
  await page.getByRole("button", { name: "Entrar (dev)" }).click();

  await expect(page).toHaveURL("/manual");
}

test("catalogo para roteiro para operacao (IM)", async ({ page }) => {
  await loginAsDevUser(page);

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

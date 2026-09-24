import { expect, test, type Page } from "@playwright/test";

async function loginAsDevUser(page: Page) {
  await page.goto("/");
  await page.getByLabel("E-mail").fill("qa@distribuidor.com");
  await page.getByRole("button", { name: "Entrar (dev)" }).click();
  await expect(page.getByRole("button", { name: "Sair" })).toBeVisible();
}

test("Ctrl+K encontra tipo GraphQL do schema publicado", async ({ page }) => {
  await loginAsDevUser(page);

  await page.goto("/docs/im");
  await page.keyboard.press("Control+k");
  await expect(page.getByRole("dialog", { name: "Busca no portal" })).toBeVisible();

  await page.getByLabel("Termo de busca").fill("TokenPayload");
  const tokenPayload = page.getByRole("option", { name: /Tipo GraphQL TokenPayload OBJECT · IM - Inventario/ });
  await expect(tokenPayload).toBeVisible();
  await expect(tokenPayload.getByText("Tipo GraphQL", { exact: true })).toBeVisible();

  await tokenPayload.click();
  await expect(page).toHaveURL("/docs/api/im/types/TokenPayload");
  await expect(page.getByRole("heading", { name: "TokenPayload" })).toBeVisible();
});

test("Ctrl+K encontra mutation do schema GraphQL", async ({ page }) => {
  await loginAsDevUser(page);

  await page.goto("/docs/api");
  await page.keyboard.press("Control+k");
  await page.getByLabel("Termo de busca").fill("saveInventories");

  await expect(page.getByRole("option", { name: /saveInventories/ }).first()).toBeVisible();
  await expect(page.getByText("Schema").first()).toBeVisible();
});

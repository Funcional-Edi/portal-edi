import { expect, test, type Page } from "@playwright/test";

async function loginAsDevUser(page: Page) {
  await page.goto("/");
  await page.getByLabel("E-mail").fill("qa-distribuidor@fidelize.com.br");
  await page.getByRole("button", { name: "Entrar (dev)" }).click();
  await expect(page.getByRole("button", { name: "Sair" })).toBeVisible();
}

test("catalogo docs/api para referencia de schema (IM)", async ({ page }) => {
  await loginAsDevUser(page);

  await page.goto("/docs/api");
  await expect(page).toHaveURL("/docs/api");
  await expect(page.getByRole("heading", { name: "Referência GraphQL" })).toBeVisible();

  await page.getByRole("link", { name: /IM - Inventario \(homolog\)/ }).click();
  await expect(page).toHaveURL("/docs/api/im");
  await expect(page.getByRole("heading", { name: "IM - Inventario (homolog)" })).toBeVisible();

  await expect(page.getByRole("heading", { name: /Mutations \(Mutation\)/ })).toBeVisible();
  await expect(page.getByText("createToken")).toBeVisible();
  await expect(page.getByText("saveInventories")).toBeVisible();

  await page.getByRole("link", { name: "Ver no roteiro" }).first().click();
  await expect(page).toHaveURL("/manual/im/operations/mutation/createToken");
  await expect(page.getByRole("heading", { name: "1. Obter token do gateway" })).toBeVisible();

  await page.getByRole("link", { name: "Ver na referência GraphQL" }).click();
  await expect(page).toHaveURL("/docs/api/im#mutation-createToken");
  await expect(page.getByText("createToken")).toBeVisible();
});

test("manual IM linka referencia GraphQL", async ({ page }) => {
  await loginAsDevUser(page);

  await page.goto("/manual/im");
  await page.getByRole("link", { name: "Ver referência GraphQL" }).click();
  await expect(page).toHaveURL("/docs/api/im");
  await expect(page.getByRole("heading", { name: "IM - Inventario (homolog)" })).toBeVisible();
});

test("catalogo mostra produto pendente de sync", async ({ page }) => {
  await loginAsDevUser(page);

  await page.goto("/docs/api");
  await expect(page.getByRole("heading", { name: "Pendentes de sync" })).toBeVisible();
  await expect(page.getByText("Wholesaler - Pedido e recebimento")).toBeVisible();
  await expect(page.getByText("Schema pendente de sync")).toBeVisible();
});

test("docs/api exige login", async ({ page }) => {
  await page.goto("/docs/api");
  await expect(page).toHaveURL(/\/(\?.*)?$/);
  await expect(page.getByLabel("E-mail")).toBeVisible();
});

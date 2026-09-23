import { expect, test, type Page } from "@playwright/test";

async function loginAsDevUser(page: Page) {
  await page.goto("/");
  await page.getByLabel("E-mail").fill("qa@distribuidor.com");
  await page.getByRole("button", { name: "Entrar (dev)" }).click();
  await expect(page.getByRole("button", { name: "Sair" })).toBeVisible();
}

test("catalogo docs/api para referencia de schema (IM)", async ({ page }) => {
  await loginAsDevUser(page);

  await page.goto("/docs/api");
  await expect(page).toHaveURL("/docs/api");
  await expect(page.getByRole("heading", { name: "Referência GraphQL" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Trade", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "IM", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "EDI Pharma", exact: true })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "EDI Varejo", exact: true })).toHaveCount(0);

  await page.getByRole("link", { name: /IM - Inventario \(homolog\)/ }).click();
  await expect(page).toHaveURL("/docs/api/im");
  await expect(page.getByRole("heading", { name: "IM - Inventario (homolog)" })).toBeVisible();

  await expect(page.getByRole("heading", { name: /Mutations \(Mutation\)/ })).toBeVisible();
  await expect(page.getByText("createToken")).toBeVisible();
  await expect(page.getByText("saveInventories")).toBeVisible();

  await page.getByRole("link", { name: "Ver no roteiro" }).first().click();
  await expect(page).toHaveURL("/docs/im/operations/mutation/createToken");
  await expect(page.getByRole("heading", { name: "1. Obter token do gateway" })).toBeVisible();

  await page.getByRole("link", { name: "Ver na referência GraphQL" }).click();
  await expect(page).toHaveURL("/docs/api/im#mutation-createToken");
  await expect(page.getByText("createToken")).toBeVisible();
});

test("drill-down de tipo na referencia GraphQL (IM)", async ({ page }) => {
  await loginAsDevUser(page);

  await page.goto("/docs/api/im");
  await page.getByRole("link", { name: "Mutation", exact: true }).click();
  await expect(page).toHaveURL("/docs/api/im/types/Mutation");
  await expect(page.getByRole("heading", { name: "Mutation" })).toBeVisible();
  await expect(page.getByText("createToken")).toBeVisible();
  await expect(page.getByText("login", { exact: true })).toBeVisible();
  await expect(page.getByText("password", { exact: true })).toBeVisible();

  await page.getByRole("link", { name: "TokenPayload" }).click();
  await expect(page).toHaveURL("/docs/api/im/types/TokenPayload");
  await expect(page.getByRole("heading", { name: "TokenPayload" })).toBeVisible();
  await expect(page.getByText("token", { exact: true })).toBeVisible();

  await page.getByRole("link", { name: "← Voltar ao schema" }).click();
  await expect(page).toHaveURL("/docs/api/im");
});

test("manual IM linka referencia GraphQL", async ({ page }) => {
  await loginAsDevUser(page);

  await page.goto("/docs/im");
  await page.getByRole("link", { name: "Ver referência GraphQL" }).click();
  await expect(page).toHaveURL("/docs/api/im");
  await expect(page.getByRole("heading", { name: "IM - Inventario (homolog)" })).toBeVisible();
});

test("catalogo mostra o schema publicado de Wholesaler", async ({ page }) => {
  await loginAsDevUser(page);

  await page.goto("/docs/api");
  const wholesaler = page.getByRole("link", { name: /Wholesaler - Pedido e recebimento/ });
  await expect(wholesaler).toHaveAttribute("href", "/docs/api/wholesaler");
  await expect(wholesaler.getByText(/Schema sincronizado/)).toBeVisible();
  await wholesaler.click();
  await expect(page).toHaveURL("/docs/api/wholesaler");
  await expect(page.getByRole("heading", { name: "Wholesaler - Pedido e recebimento", exact: true })).toBeVisible();
});

test("docs/api exige login", async ({ page }) => {
  await page.goto("/docs/api");
  await expect(page).toHaveURL(/\/(\?.*)?$/);
  await expect(page.getByLabel("E-mail")).toBeVisible();
});

import { expect, test, type Page } from "@playwright/test";

async function loginAsDevUser(page: Page) {
  await page.goto("/");

  await page.getByLabel("E-mail").fill("qa@distribuidor.com");
  await page.getByRole("button", { name: "Entrar (dev)" }).click();

  await expect(page.getByRole("button", { name: "Sair" })).toBeVisible();
}

async function loginAsDevAdmin(page: Page) {
  await page.goto("/");
  await page.getByLabel("E-mail").fill("admin@empresa.com");
  await page.getByRole("button", { name: "Entrar (dev)" }).click();
  await expect(page.getByRole("button", { name: "Sair" })).toBeVisible();
}

test("produto na navbar para manual e operacao (IM)", async ({ page }) => {
  await loginAsDevUser(page);

  await page.goto("/docs");
  await expect(page).toHaveURL("/docs");
  await expect(page.getByRole("heading", { name: "Documentação" })).toBeVisible();
  const products = page.getByRole("navigation", { name: "Produtos EDI" });
  await products.getByRole("link", { name: "Trade", exact: true }).click();
  await products.getByRole("link", { name: /^IM/ }).click();

  await expect(page).toHaveURL("/docs/im");
  await expect(page.getByRole("heading", { name: "Integracao IM - Inventario" })).toBeVisible();
  await expect(
    page.locator("aside").last().getByRole("link", { name: /1\. Obter token do gateway/ }),
  ).toHaveClass(/ml-4/);

  await page
    .locator("#roteiro-integracao")
    .getByRole("link", { name: /1\. Obter token do gateway/ })
    .click();

  await expect(page).toHaveURL("/docs/im/operations/mutation/createToken");
  await expect(page.getByRole("heading", { name: "1. Obter token do gateway" })).toBeVisible();
  await expect(page.getByText("mutation createToken", { exact: false })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Consulte o Roteiro de Homologação" })).toBeVisible();
  const homologation = page.getByRole("link", { name: "Ver o Roteiro de Homologação" });
  await expect(homologation).toHaveAttribute(
    "href",
    "/docs/im#roteiro-integracao",
  );
  await homologation.click();
  await expect(page).toHaveURL("/docs/im#roteiro-integracao");
  await expect(
    page.getByRole("navigation", { name: "Produtos EDI" }).getByRole("link", {
      name: "Roteiro de Homologação",
      exact: true,
    }),
  ).toHaveAttribute("aria-current", "page");
});

test("/manual redireciona para /docs", async ({ page }) => {
  await loginAsDevUser(page);

  await page.goto("/manual/im");
  await expect(page).toHaveURL("/docs/im");
});

test("distribuidor nao ve link de Teste de Requisição", async ({ page }) => {
  await loginAsDevUser(page);

  await page.goto("/docs/im/operations/mutation/createToken");
  await expect(page.getByRole("link", { name: "Teste de Requisição" })).toHaveCount(0);
  await expect(page.getByText(/disponível apenas para perfil admin/i)).toBeVisible();
});

test("admin abre playground com exemplo pre-preenchido", async ({ page }) => {
  await loginAsDevAdmin(page);

  await page.goto("/docs/im/operations/mutation/createToken");
  await page.locator("article").getByRole("link", { name: "Teste de Requisição" }).click();
  await expect(page).toHaveURL(/\/docs\/im\/playground\?query=/);
  await expect(page.getByRole("heading", { name: "Integracao IM - Inventario" })).toBeVisible();
  await expect(page.locator("#playground-query")).toHaveValue(/mutation createToken/);
});

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
  const index = page.locator("aside").last();
  await expect(index.getByRole("link", { name: "Visao geral", exact: true })).toBeVisible();
  await expect(index.getByRole("link", { name: /1\. Obter token do gateway/ })).toHaveCount(0);

  await products.getByRole("link", { name: "Jornada da Integração", exact: true }).click();
  await expect(
    index.getByRole("link", { name: /1\. Obter token do gateway/ }).first(),
  ).toHaveClass(/ml-4/);

  const firstStepLink = index.getByRole("link", { name: /1\. Obter token do gateway/ }).first();
  await expect(firstStepLink).toHaveAttribute("href", "#jornada-operacao-1");
  await firstStepLink.click();
  await expect(page).toHaveURL("/docs/im#jornada-operacao-1");

  const firstStep = page.locator("#jornada-operacao-1");
  await firstStep.locator("summary").click();
  await expect(firstStep.getByText("mutation createToken", { exact: false })).toBeVisible();
  await expect(page).toHaveURL("/docs/im#jornada-operacao-1");

  await page.goto("/docs/im/operations/mutation/createToken");
  await expect(page.getByRole("heading", { name: "1. Obter token do gateway" })).toBeVisible();
  await expect(page.getByText("mutation createToken", { exact: false })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Consulte a Jornada da Integração" })).toBeVisible();
  const integrationGuide = page.getByRole("link", { name: "Ver a Jornada da Integração" });
  await expect(integrationGuide).toHaveAttribute(
    "href",
    "/docs/im#jornada-integracao",
  );
  await integrationGuide.click();
  await expect(page).toHaveURL("/docs/im#jornada-integracao");
  await expect(
    page.getByRole("navigation", { name: "Produtos EDI" }).getByRole("link", {
      name: "Jornada da Integração",
      exact: true,
    }),
  ).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("heading", { name: "Jornada da Integração" })).toBeVisible();
  await expect(page.getByRole("link", { name: "1. Obter token do gateway", exact: true })).toBeVisible();
});

test("CA mostra atalho para cenários e detalhes por fluxo", async ({ page }) => {
  await loginAsDevUser(page);
  await page.goto("/docs/canal-autorizador");
  await expect(page.locator("section#jornada-integracao #fluxograma-individual")).toHaveCount(0);

  const products = page.getByRole("navigation", { name: "Produtos EDI" });
  await products.getByRole("link", { name: "Cenário de Teste", exact: true }).click();

  const scenarios = page.locator("section#roteiro-integracao");
  await expect(scenarios).toHaveCount(1);
  await expect(scenarios.locator("h5")).toHaveCount(15);
  await expect(scenarios.locator("h5").first()).toHaveText("Pedido totalmente faturado");
  await expect(scenarios.locator("h5").first()).toBeVisible();
  await expect(page).toHaveURL(/#roteiro-integracao$/);
  await expect(scenarios.getByRole("heading", { name: "Pedido totalmente faturado" }).first()).toBeVisible();
  await expect(scenarios.getByText(/Todos os produtos do pré-pedido precisam receber retorno/)).toBeVisible();

  await products.getByRole("link", { name: "Documentação", exact: true }).click();
  const flows = page.locator("#fluxogramas");
  await expect(flows.getByText("createGroupedResponse", { exact: true })).toBeVisible();
  await expect(flows.getByText(/comunique a pessoa responsável pelo EDI/)).toBeVisible();

  await page.goto("/docs/canal-autorizador#jornada-integracao");
  const orderStep = page.locator("#jornada-operacao-2");
  await expect(orderStep.locator("summary").first()).toContainText("Criar pré-pedido");
  await orderStep.locator("summary").first().click();
  await expect(orderStep.getByRole("heading", { name: "Pré-requisitos" })).toBeVisible();
  await expect(orderStep.getByRole("heading", { name: "Observação" })).toBeVisible();
  await expect(orderStep.getByRole("heading", { name: "Campos da requisição" })).toBeVisible();
  await expect(orderStep.getByRole("heading", { name: "Tabelas de referência" })).toBeVisible();
  await expect(orderStep.getByRole("heading", { name: "Exemplo GraphQL" })).toBeVisible();
  await expect(orderStep.getByText(/industry_abbreviation só é obrigatório/)).toBeVisible();
  await expect(page).toHaveURL("/docs/canal-autorizador#jornada-integracao");
});

test("atalho de cenários continua disponível no teste de requisição", async ({ page }) => {
  await loginAsDevAdmin(page);
  await page.goto("/docs/canal-autorizador");

  const products = page.getByRole("navigation", { name: "Produtos EDI" });
  await products.getByRole("link", { name: "Teste de Requisição", exact: true }).click();
  await expect(page).toHaveURL(/\/playground/);

  const scenarioLink = products.getByRole("link", { name: "Cenário de Teste", exact: true });
  await expect(scenarioLink).toBeVisible();
  await scenarioLink.click();
  await expect(page).toHaveURL("/docs/canal-autorizador#roteiro-integracao");
  await expect(
    page.locator("section#roteiro-integracao").getByRole("heading", { name: "Pedido totalmente faturado" }).first(),
  ).toBeVisible();
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

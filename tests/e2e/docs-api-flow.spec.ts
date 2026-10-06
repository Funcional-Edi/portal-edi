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

  await page.getByRole("link", { name: "Ver na Jornada" }).first().click();
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

test("referência GraphQL dos subprodutos Credenciado oculta origem e sincronização", async ({ page }) => {
  await loginAsDevUser(page);

  await page.goto("/docs/api/credenciado-cadastro");
  await expect(page.getByRole("heading", { name: "Fluxo de Cadastro", exact: true })).toBeVisible();
  await expect(page.getByText("https://developer.funcionalmais.com/api-ref/index.html")).toHaveCount(0);
  await expect(page.getByText(/Sincronizado em/)).toHaveCount(0);
  await expect(page.getByText(/\d+ tipos/)).toBeVisible();
});

test("tabela de resposta da Jornada mantém colunas legíveis", async ({ page }) => {
  await loginAsDevUser(page);

  await page.goto("/docs/credenciado-cadastro#jornada-integracao");
  const responseTable = page.locator("#jornada-operacao-1-campos-resposta table");
  await expect(responseTable).toHaveCSS("table-layout", "fixed");
  await expect(responseTable).toHaveCSS("min-width", "1024px");
});

test("jornadas Credenciado começam pela autenticação do Gateway", async ({ page }) => {
  await loginAsDevUser(page);

  for (const slug of [
    "credenciado-cadastro",
    "credenciado-optin",
    "credenciado-pbm-caixa",
    "credenciado-venda",
  ]) {
    await page.goto(`/docs/${slug}#jornada-integracao`);
    const authentication = page.locator("#jornada-autenticacao-token");
    await expect(authentication).toBeVisible();
    await expect(authentication).toContainText("createToken");
    await expect(authentication).toContainText('"data"');
    await expect(authentication).toContainText('"createToken"');
    await expect(authentication).toContainText("Authorization: Bearer");
    await expect(page.locator("#jornada-integracao ol > li").first()).toHaveAttribute(
      "id",
      "jornada-autenticacao-token"
    );
  }

  await page.goto("/docs/credenciado-cadastro#jornada-integracao");
  await page.locator("#jornada-operacao-1 > summary").click();
  const longType = page.getByRole("link", { name: /Pharma_RegistrationPolicyExtraFieldOption/ }).first();
  await expect(longType).toHaveCSS("overflow-wrap", "break-word");
});

test("upload da receita no Fluxo de Venda segue a estrutura multipart oficial", async ({ page }) => {
  await loginAsDevUser(page);
  await page.goto("/docs/credenciado-venda#jornada-integracao");

  const upload = page.locator("#jornada-operacao-3");
  await upload.locator("summary").click();
  await expect(upload.getByRole("heading", { name: "Estrutura multipart/form-data" })).toBeVisible();
  await expect(upload).toContainText("Prescription_uploadPrescription");
  await expect(upload).toContainText('"uploaded_file":["variables.file"]');
  await expect(upload).toContainText("Prescription_addPrescription");
  await expect(upload.getByRole("link", { name: "Teste de Requisição" })).toHaveCount(0);
});

test("Credenciado oferece roteiro de homologação e deixa pendências explícitas", async ({ page }) => {
  await loginAsDevUser(page);
  await page.goto("/docs?produto=credenciado");
  await page.getByRole("button", { name: "Roteiro de Homologação" }).click();

  await expect(page.getByRole("heading", { name: "Roteiro de Homologação", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Cenários por subproduto" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Fluxo de Cadastro/ })).toHaveAttribute(
    "href",
    "/docs/credenciado-cadastro#roteiro-integracao"
  );
  await expect(page.getByRole("button", { name: "Documento em preparação" })).toBeDisabled();
  await expect(page.getByText("E-mail/canal para envio")).toBeVisible();
});

test("docs/api exige login", async ({ page }) => {
  await page.goto("/docs/api");
  await expect(page).toHaveURL(/\/(\?.*)?$/);
  await expect(page.getByLabel("E-mail")).toBeVisible();
});

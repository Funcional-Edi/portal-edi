import { expect, test, type Page } from "@playwright/test";
import { rm } from "node:fs/promises";
import path from "node:path";

/**
 * Fluxo REST (PSP): criar projeto com protocolo REST pelo admin, cadastrar
 * uma operação REST (method/path/exampleBody) e verificar que a leitura
 * pública mostra "Endpoint" em vez de "Exemplo GraphQL"/playground.
 */
const SLUG_REST = "e2e-rest-flow";

const PROJECT_DIR = path.join(process.cwd(), "content", "projects", SLUG_REST);

async function loginAsAdmin(page: Page) {
  await page.goto("/admin/projects");
  await expect(page).toHaveURL(/callbackUrl=%2Fadmin%2Fprojects/);

  await page.getByLabel("E-mail").fill("admin@funcionalcorp.com.br");
  await page.getByRole("button", { name: "Entrar (dev)" }).click();

  await expect(page).toHaveURL("/admin/projects");
}

test.afterEach(async () => {
  await rm(PROJECT_DIR, { recursive: true, force: true });
});

test("cria projeto REST, cadastra endpoint e publica", async ({ page }) => {
  await loginAsAdmin(page);

  await page.goto("/admin/projects/new");
  await page.getByLabel("Slug").fill(SLUG_REST);
  await page.getByLabel("Nome", { exact: true }).fill("REST Flow E2E");
  await page.getByLabel("Família").selectOption({ label: "EDI Varejo" });
  await page.getByLabel("Protocolo").selectOption({ label: "REST" });
  await page.getByRole("button", { name: "Criar projeto" }).click();

  await expect(page).toHaveURL(`/admin/projects/${SLUG_REST}`);
  await expect(page.getByText("REST", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Conectar API" })).toBeVisible();

  await page.getByRole("link", { name: "Abrir editor do manual" }).click();
  await expect(page).toHaveURL(`/admin/projects/${SLUG_REST}/edit`);

  await page.getByRole("button", { name: "Editar cabeçalho" }).click();
  await page.getByLabel("Título do manual").fill("Integracao REST Flow E2E");
  await page.getByRole("button", { name: "Salvar cabeçalho" }).click();

  await page.getByRole("button", { name: "Nova seção" }).click();
  await page.getByLabel("Título da seção").fill("Visao geral");
  await page.getByRole("button", { name: "Criar seção" }).click();
  await page.getByRole("button", { name: "Editar", exact: true }).click();
  await page
    .getByLabel("Markdown")
    .fill(
      "# Visao geral\n\nSecao criada pelo teste E2E de fluxo REST, com corpo suficiente para o checklist.\n"
    );
  await page.getByRole("button", { name: "Salvar seção" }).click();
  await expect(page.getByRole("button", { name: "Salvar seção" })).toBeHidden();

  await page.getByRole("button", { name: "Nova operação" }).click();
  await page.getByLabel("Tipo").selectOption("rest");
  await page.getByLabel("Nome (identificador único)").fill("consultaStatus");
  await page.getByLabel("Descrição").fill("Consulta o status do pedido no PSP.");
  await page.getByLabel("Método").selectOption("GET");
  await page.getByLabel("Caminho (path)").fill("/pedidos/status");
  await page.getByRole("button", { name: "Salvar operação" }).click();

  await expect(page.getByText(/Pronto para publicar/)).toBeVisible();
  await page.getByRole("button", { name: "Publicar" }).click();
  await expect(page.getByRole("button", { name: "Despublicar" })).toBeVisible();

  await page.goto(`/docs/${SLUG_REST}`);
  await expect(page.getByText("GET").first()).toBeVisible();

  await page
    .locator("#roteiro-integracao")
    .getByRole("link", { name: /consultaStatus/ })
    .click();
  await expect(page).toHaveURL(`/docs/${SLUG_REST}/operations/rest/consultaStatus`);
  await expect(page.getByRole("heading", { name: "Endpoint" })).toBeVisible();
  await expect(page.getByText("GET /pedidos/status")).toBeVisible();
  await expect(page.getByText("Exemplo GraphQL")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Teste de Requisição" })).toHaveCount(0);
});

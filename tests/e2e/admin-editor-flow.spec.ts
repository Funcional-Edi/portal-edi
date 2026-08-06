import { expect, test, type Page } from "@playwright/test";
import { rm } from "node:fs/promises";
import path from "node:path";

/**
 * Fase 6: o EDI monta o manual no editor unificado e o distribuidor vê o
 * resultado na mesma estrutura de tela.
 *
 * O teste cria um projeto descartável para não sujar o conteúdo real
 * (`content/projects/im`, `wholesaler`) — a pasta é apagada no fim.
 */
const SLUG = "e2e-editor";
const PROJECT_DIR = path.join(process.cwd(), "content", "projects", SLUG);

const MANUAL_TITLE = "Integracao Editor E2E";
const SECTION_MARKER = "Conteudo escrito pelo editor unificado no teste E2E.";
const SECTION_BODY = [
  "# Visao geral E2E",
  "",
  SECTION_MARKER,
  "",
  "A secao precisa de corpo suficiente para passar no checklist de qualidade.",
  "",
].join("\n");

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

test("admin monta o manual no editor unificado e distribuidor ve o resultado", async ({
  page,
}) => {
  await loginAsAdmin(page);

  await page.goto("/admin/projects/new");
  await page.getByLabel("Slug").fill(SLUG);
  await page.getByLabel("Nome", { exact: true }).fill("Editor E2E");
  await page.getByRole("button", { name: "Criar projeto" }).click();

  await expect(page).toHaveURL(`/admin/projects/${SLUG}`);

  await page.getByRole("link", { name: "Abrir editor do manual" }).click();
  await expect(page).toHaveURL(`/admin/projects/${SLUG}/edit`);

  // Projeto novo reprova no checklist: publicar fica bloqueado.
  await expect(page.getByText(/pendências bloqueando/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Publicar" })).toBeDisabled();

  await page.getByRole("button", { name: "Editar cabeçalho" }).click();
  await page.getByLabel("Título do manual").fill(MANUAL_TITLE);
  await page.getByLabel("Produto (opcional)").fill("Editor E2E Gateway");
  await page.getByRole("button", { name: "Salvar cabeçalho" }).click();

  await expect(page.getByRole("heading", { name: MANUAL_TITLE })).toBeVisible();

  await page.getByRole("button", { name: "Nova seção" }).click();
  await page.getByLabel("Título da seção").fill("Visao geral E2E");
  await page.getByRole("button", { name: "Criar seção" }).click();

  await expect(page.getByText("visao-geral-e2e.md")).toBeVisible();

  // Edição inline: textarea Markdown + preview no mesmo card do leitor.
  await page.getByRole("button", { name: "Editar", exact: true }).click();
  await page.getByLabel("Markdown").fill(SECTION_BODY);
  // O preview renderiza o Markdown com o mesmo MarkdownBody do leitor.
  await expect(page.getByRole("paragraph").filter({ hasText: SECTION_MARKER })).toBeVisible();
  await page.getByRole("button", { name: "Salvar seção" }).click();

  await expect(page.getByRole("button", { name: "Salvar seção" })).toBeHidden();

  await page.getByRole("button", { name: "Nova operação" }).click();
  await page.getByLabel("Nome (campo GraphQL)").fill("listItems");
  await page.getByLabel("Descrição").fill("Lista os itens disponiveis no gateway.");
  await page.getByLabel("Exemplo GraphQL").fill("query listItems { listItems { id } }");
  await page.getByRole("button", { name: "Salvar operação" }).click();

  // Checklist aprovado: publicar libera.
  await expect(page.getByText(/Pronto para publicar/)).toBeVisible();
  await page.getByRole("button", { name: "Publicar" }).click();
  await expect(page.getByRole("button", { name: "Despublicar" })).toBeVisible();

  // Visão do distribuidor: mesmo layout, sem controles de edição.
  await page.goto(`/manual/${SLUG}`);
  await expect(page.getByRole("heading", { name: MANUAL_TITLE })).toBeVisible();
  await expect(page.getByText(SECTION_MARKER)).toBeVisible();
  await expect(
    page.locator("#roteiro-integracao").getByRole("link", { name: /listItems/ })
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Nova seção" })).toHaveCount(0);
});

test("rota legacy /curate redireciona para o editor", async ({ page }) => {
  await loginAsAdmin(page);

  await page.goto("/admin/projects/new");
  await page.getByLabel("Slug").fill(SLUG);
  await page.getByLabel("Nome", { exact: true }).fill("Editor E2E");
  await page.getByRole("button", { name: "Criar projeto" }).click();
  await expect(page).toHaveURL(`/admin/projects/${SLUG}`);

  await page.goto(`/admin/projects/${SLUG}/curate`);
  await expect(page).toHaveURL(`/admin/projects/${SLUG}/edit`);
});

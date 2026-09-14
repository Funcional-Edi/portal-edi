import { expect, test, type Page } from "@playwright/test";
import { rm } from "node:fs/promises";
import path from "node:path";

/**
 * Familias de produto (EDI Pharma / EDI Varejo): entrada em /docs, depois
 * catálogo por família. Os testes criam projetos descartaveis (apagados no fim).
 */
const SLUG_VAREJO = "e2e-familia-varejo";
const SLUG_RECLASSIFICA = "e2e-familia-reclassifica";

const PROJECT_DIRS = [SLUG_VAREJO, SLUG_RECLASSIFICA].map((slug) =>
  path.join(process.cwd(), "content", "projects", slug)
);

async function loginAsAdmin(page: Page) {
  await page.goto("/admin/projects");
  await expect(page).toHaveURL(/callbackUrl=%2Fadmin%2Fprojects/);

  await page.getByLabel("E-mail").fill("admin@empresa.com");
  await page.getByRole("button", { name: "Entrar (dev)" }).click();

  await expect(page).toHaveURL("/admin/projects");
}

async function createPublishableProject(
  page: Page,
  slug: string,
  name: string,
  familyLabel: string
) {
  await page.goto("/admin/projects/new");
  await page.getByLabel("Slug").fill(slug);
  await page.getByLabel("Nome", { exact: true }).fill(name);
  await page.getByLabel("Família").selectOption({ label: familyLabel });
  await page.getByRole("button", { name: "Criar projeto" }).click();

  await expect(page).toHaveURL(`/admin/projects/${slug}`);

  await page.getByRole("link", { name: "Abrir editor do manual" }).click();
  await expect(page).toHaveURL(`/admin/projects/${slug}/edit`);

  await page.getByRole("button", { name: "Editar cabeçalho" }).click();
  await page.getByLabel("Título do manual").fill(`Integracao ${name}`);
  await page.getByRole("button", { name: "Salvar cabeçalho" }).click();

  await page.getByRole("button", { name: "Nova seção" }).click();
  await page.getByLabel("Título da seção").fill("Visao geral");
  await page.getByRole("button", { name: "Criar seção" }).click();
  await page.getByRole("button", { name: "Editar", exact: true }).click();
  await page
    .getByLabel("Markdown")
    .fill(
      "# Visao geral\n\nSecao criada pelo teste E2E de familias de produto, com corpo suficiente para o checklist.\n"
    );
  await page.getByRole("button", { name: "Salvar seção" }).click();
  await expect(page.getByRole("button", { name: "Salvar seção" })).toBeHidden();

  await page.getByRole("button", { name: "Nova operação" }).click();
  await page.getByLabel("Nome (campo GraphQL)").fill("listItems");
  await page.getByLabel("Descrição").fill("Lista os itens disponiveis no gateway.");
  await page.getByLabel("Exemplo GraphQL").fill("query listItems { listItems { id } }");
  await page.getByRole("button", { name: "Salvar operação" }).click();

  await expect(page.getByText(/Pronto para publicar/)).toBeVisible();
  await page.getByRole("button", { name: "Publicar" }).click();
  await expect(page.getByRole("button", { name: "Despublicar" })).toBeVisible();
}

test.afterEach(async () => {
  await Promise.all(PROJECT_DIRS.map((dir) => rm(dir, { recursive: true, force: true })));
});

test("fluxo /docs escolhe familia e lista produtos publicados", async ({ page }) => {
  await loginAsAdmin(page);
  await createPublishableProject(page, SLUG_VAREJO, "Familia Varejo E2E", "EDI Varejo");

  await page.goto("/docs");
  await expect(page.getByRole("heading", { name: "Documentação" })).toBeVisible();
  await expect(page.getByRole("link", { name: /EDI Pharma/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /EDI Varejo/ })).toBeVisible();

  await page.getByRole("link", { name: /EDI Varejo/ }).click();
  await expect(page).toHaveURL("/docs/edi-varejo");
  await expect(page.getByRole("link", { name: /Familia Varejo E2E/ })).toBeVisible();

  await page.getByRole("link", { name: "Todas as famílias" }).click();
  await expect(page).toHaveURL("/docs");

  await page.getByRole("link", { name: /EDI Pharma/ }).click();
  await expect(page).toHaveURL("/docs/edi-pharma");
  await expect(page.getByRole("link", { name: /IM - Inventario/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Familia Varejo E2E/ })).toHaveCount(0);
});

test("admin reclassifica a familia de um projeto existente", async ({ page }) => {
  await loginAsAdmin(page);

  await page.goto("/admin/projects/new");
  await page.getByLabel("Slug").fill(SLUG_RECLASSIFICA);
  await page.getByLabel("Nome", { exact: true }).fill("Reclassifica E2E");
  await page.getByLabel("Família").selectOption({ label: "EDI Pharma" });
  await page.getByRole("button", { name: "Criar projeto" }).click();
  await expect(page).toHaveURL(`/admin/projects/${SLUG_RECLASSIFICA}`);

  const familySelect = page.getByLabel("Família do produto");
  await expect(familySelect).toHaveValue("edi-pharma");

  const familyPatch = page.waitForResponse(
    (response) => response.url().includes("/family") && response.request().method() === "PATCH"
  );
  await familySelect.selectOption({ label: "EDI Varejo" });
  await familyPatch;
  await expect(page.getByLabel("Família do produto")).toHaveValue("edi-varejo");

  await page.reload();
  await expect(page.getByLabel("Família do produto")).toHaveValue("edi-varejo");
});

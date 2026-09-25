import { expect, test, type Page } from "@playwright/test";
import { readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Catálogos legados por família continuam acessíveis diretamente.
 * /docs agora é uma introdução por produto, sem duplicar esses catálogos.
 * Os testes criam projetos descartáveis (apagados no fim).
 */
const SLUG_VAREJO = "e2e-familia-varejo";
const SLUG_RECLASSIFICA = "e2e-familia-reclassifica";

const PROJECT_DIRS = [SLUG_VAREJO, SLUG_RECLASSIFICA].map((slug) =>
  path.join(process.cwd(), "content", "projects", slug)
);

async function loginAsAdmin(page: Page) {
  await page.goto("/admin/projects");
  await expect(page).toHaveURL(/callbackUrl=%2Fadmin%2Fprojects/);

  await page.getByLabel("E-mail").fill("admin@funcionalcorp.com.br");
  await page.getByRole("button", { name: "Entrar (dev)" }).click();

  await expect(page).toHaveURL("/admin/projects");
}

async function createPublishableProject(page: Page, slug: string, name: string) {
  const created = await page.request.post("/api/living-docs/projects", {
    data: { slug, name, productId: "trade", protocol: "graphql" },
  });
  expect(created.ok()).toBeTruthy();

  await page.goto("/docs?produto=trade");
  await expect(page.getByRole("button", { name })).toBeVisible();

  await page.goto(`/admin/projects/${slug}/edit`);
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
  await Promise.all(PROJECT_DIRS.map((dir) => rm(dir, {
    recursive: true,
    force: true,
    maxRetries: 3,
    retryDelay: 100,
  })));
  for (const [productId, slug] of [
    ["trade", SLUG_VAREJO],
    ["credenciado", SLUG_RECLASSIFICA],
  ] as const) {
    const productFile = path.join(process.cwd(), "content", "products", productId, "config.json");
    const product = JSON.parse(await readFile(productFile, "utf8")) as { modules: { projectSlug?: string }[] };
    product.modules = product.modules.filter((module) => module.projectSlug !== slug);
    await writeFile(productFile, `${JSON.stringify(product, null, 2)}\n`);
  }
});

test("introducao em /docs preserva rotas de catalogos por familia", async ({ page }) => {
  await loginAsAdmin(page);
  await createPublishableProject(page, SLUG_VAREJO, "Familia Varejo E2E");

  await page.goto("/docs");
  await expect(page.getByRole("heading", { name: "Documentação" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Sua trilha de integração" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Catálogos por família" })).toHaveCount(0);

  await page.goto("/docs?produto=trade");
  await expect(page.getByRole("link", { name: /Familia Varejo E2E/ })).toBeVisible();

  await page.goto("/docs/edi-pharma");
  await expect(page).toHaveURL("/docs/edi-pharma");
  await expect(page.getByRole("link", { name: /IM - Inventario/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Familia Varejo E2E/ })).toHaveCount(0);
});

test("projeto novo aparece no produto escolhido, nao numa familia", async ({ page }) => {
  await loginAsAdmin(page);

  const created = await page.request.post("/api/living-docs/projects", {
    data: { slug: SLUG_RECLASSIFICA, name: "Reclassifica E2E", productId: "credenciado", protocol: "graphql" },
  });
  expect(created.ok()).toBeTruthy();
  await page.goto("/docs?produto=credenciado");

  await expect(page).toHaveURL("/docs?produto=credenciado");
  await expect(page.getByRole("button", { name: "Reclassifica E2E" })).toBeVisible();
  await expect(page.getByLabel("Família")).toHaveCount(0);
});

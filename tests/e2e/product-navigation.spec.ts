import { expect, test, type Page } from "@playwright/test";

async function login(page: Page, admin = false) {
  await page.goto("/");
  const dev = page.getByRole("tab", { name: "Login local (dev)" });
  if (await dev.count()) await dev.click();
  await page.getByLabel("E-mail").fill(admin ? "admin@funcionalcorp.com.br" : "qa@distribuidor.com");
  await page.getByRole("button", { name: "Entrar (dev)" }).click();
  await expect(page.getByRole("button", { name: "Sair" })).toBeVisible();
  await page.goto("/docs");
}

test("one vertical navbar changes from products to product and integration context", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await login(page);
  const nav = page.getByRole("navigation", { name: "Produtos EDI" });

  for (const label of ["Credenciado", "Movimentação de Vidas", "Trade", "APS", "PBM", "Documentação (Clientes)"]) {
    await expect(nav.getByText(label, { exact: true })).toBeVisible();
  }
  await expect(nav.getByRole("button", { name: "Queries", exact: true })).toHaveCount(0);
  await expect(nav.getByRole("button", { name: "Mutations", exact: true })).toHaveCount(0);

  await nav.getByRole("link", { name: "Trade", exact: true }).click();
  await expect(page).toHaveURL("/docs?produto=trade");
  await expect(page.getByRole("heading", { name: "Trade", exact: true })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Credenciado", exact: true })).toHaveCount(0);
  await expect(nav.getByRole("link", { name: "Produtos", exact: true })).toBeVisible();
  await expect(nav.getByRole("link", { name: /^Canal Autorizador/ })).toHaveAttribute("href", "/docs/canal-autorizador");
  await expect(nav.getByRole("link", { name: /^Wholesaler/ })).toHaveAttribute("href", "/docs/wholesaler");
  await expect(nav.getByRole("link", { name: /^IM/ })).toHaveAttribute("href", "/docs/im");
  await expect(nav.getByRole("button", { name: /^EDI Redes/ })).toBeDisabled();

  await nav.getByRole("link", { name: /^Canal Autorizador/ }).click();
  await expect(page.getByRole("heading", { name: "Canal Autorizador", exact: true })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Voltar aos produtos", exact: true })).toHaveAttribute("href", "/docs");
  const documentation = nav.getByRole("link", { name: "Documentação", exact: true }).last();
  await expect(documentation).toHaveAttribute("href", "/docs/canal-autorizador");
  await expect(nav.getByRole("button", { name: "Queries", exact: true })).toHaveCount(0);
  await expect(nav.getByRole("button", { name: "Mutations", exact: true })).toHaveCount(0);
  await expect(nav.getByRole("button", { name: "Métodos", exact: true })).toHaveCount(0);
  await expect(nav.getByRole("link", { name: "Teste de Requisição", exact: true })).toHaveCount(0);
  await expect(page).toHaveURL("/docs/canal-autorizador");
  await expect(page.getByText("Seu ponto de partida", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Índice", { exact: true })).toBeVisible();
  const journey = nav.getByRole("link", { name: "Jornada da Integração", exact: true });
  await journey.click();
  await expect(page).toHaveURL("/docs/canal-autorizador#jornada-integracao");
  await expect(journey).toHaveAttribute("aria-current", "page");
  const integrationGuide = nav.getByRole("link", { name: "Cenário de Teste", exact: true });
  await integrationGuide.click();
  await expect(page).toHaveURL("/docs/canal-autorizador#roteiro-integracao");
  await expect(integrationGuide).toHaveAttribute("aria-current", "page");

  await page.goBack();
  await expect(page).toHaveURL("/docs/canal-autorizador#jornada-integracao");
  await page.goBack();
  await expect(page).toHaveURL("/docs?produto=trade");
  await nav.getByRole("link", { name: /^Wholesaler/ }).click();
  await expect(page).toHaveURL("/docs/wholesaler");
  await nav.getByRole("link", { name: "Voltar aos produtos", exact: true }).click();
  await expect(page).toHaveURL("/docs");
  await nav.getByRole("link", { name: "Trade", exact: true }).click();
  await expect(page).toHaveURL("/docs?produto=trade");
  await nav.getByRole("link", { name: /^IM/ }).click();
  await expect(page).toHaveURL("/docs/im");
  await page.goBack();
  await expect(page).toHaveURL("/docs?produto=trade");
  await nav.getByRole("link", { name: "Produtos", exact: true }).click();
  await expect(page).toHaveURL("/docs");
  await expect(page.getByText("Seu ponto de partida", { exact: true })).toBeVisible();

  const navBox = await nav.boundingBox();
  const contentBox = await page.getByRole("region", { name: "Conteúdo da documentação" }).boundingBox();
  expect(navBox!.x + navBox!.width).toBeLessThan(contentBox!.x);
  await page.screenshot({ path: testInfo.outputPath("docs-contextual-desktop.png"), fullPage: true });
});

test("Credenciado apresenta estrutura inicial sem simular documentação", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await login(page);
  const nav = page.getByRole("navigation", { name: "Produtos EDI" });

  const credenciado = nav.getByRole("link", { name: /^Credenciado/ });
  await expect(credenciado).toContainText("Sem documentação");
  await expect(credenciado).toContainText("homolog");
  await credenciado.click();
  await expect(page).toHaveURL("/docs?produto=credenciado");
  const content = page.getByRole("region", { name: "Conteúdo da documentação" });
  await expect(content).toContainText("Sem documentação");
  await expect(content).toContainText("homolog");
  await expect(page.getByRole("heading", { name: "Estrutura do Credenciado", exact: true })).toHaveCount(0);
  await expect(nav.getByText("Estrutura do Credenciado", { exact: true })).toBeVisible();
  await expect(nav.getByRole("button", { name: "Visão Geral", exact: true })).toBeVisible();
  await expect(nav.getByRole("button", { name: "Cenários de Testes e Validações", exact: true })).toBeVisible();
  await expect(nav.getByText("Fluxo de Cadastro", { exact: true })).toBeVisible();
  await expect(nav.getByText("Fluxo PBM no Caixa", { exact: true })).toBeVisible();
  await expect(nav.getByText("SUBPRODUTOS", { exact: true })).toHaveCount(0);
  await expect(nav.getByText("teste-01", { exact: true })).toHaveCount(0);
  await expect(nav.getByText("Associar o produto ao cadastro do beneficiário", { exact: true })).toHaveCount(0);
  await expect(nav.getByText("Versão do subproduto", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Jornada do anexo de receita", { exact: true })).toHaveCount(0);
});

test("Canal Autorizador exibe os dois fluxos no índice de fluxogramas", async ({ page }) => {
  await login(page);
  const nav = page.getByRole("navigation", { name: "Produtos EDI" });

  await nav.getByRole("link", { name: "Trade", exact: true }).click();
  await nav.getByRole("button", { name: "Fluxograma Completo", exact: true }).click();

  const content = page.getByRole("region", { name: "Conteúdo da documentação" });
  const distributorFlow = content.getByRole("link", {
    name: /Canal Autorizador — Fluxo 1 — Retorno enviado pelo Distribuidor/,
  });
  const automaticFlow = content.getByRole("link", {
    name: /Canal Autorizador — Fluxo 2 — Retorno Automático/,
  });

  await expect(distributorFlow).toHaveAttribute(
    "href",
    "/fluxogramas/canal-autorizador?fluxo=retorno-distribuidor",
  );
  await expect(automaticFlow).toHaveAttribute(
    "href",
    "/fluxogramas/canal-autorizador?fluxo=retorno-automatico",
  );
});

test("mobile navigation preserves context without horizontal overflow", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  const nav = page.getByRole("navigation", { name: "Produtos EDI" });
  const menu = page.getByRole("button", { name: "Mostrar produtos" });

  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await menu.click();
  await nav.getByRole("link", { name: "Trade", exact: true }).click();
  await nav.getByRole("link", { name: /^IM/ }).click();
  await expect(page.getByRole("heading", { name: "IM", exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("docs-contextual-mobile.png"), fullPage: true });
});

test("contextual index follows the selected subproduct area", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await login(page);
  await page.goto("/docs/canal-autorizador");

  const productNav = page.getByRole("navigation", { name: "Produtos EDI" });
  const index = page.locator("aside").filter({ hasText: "Índice" });
  await expect(index).toHaveCount(1);
  await expect(index.locator("div.sticky")).toHaveClass(/overflow-y-auto/);
  await expect(index).not.toContainText("Integração Canal Autorizador — Transfer Order");
  await expect(index).not.toContainText("Canal Autorizador");
  await expect(index).toContainText("Contexto");
  await expect(index).not.toContainText("Jornada da Integração");
  await expect(index).not.toContainText("Roteiro de Integração");
  const businessRulesLink = index.getByRole("link", { name: "Regras de Negócios", exact: true });
  await expect(businessRulesLink).toHaveAttribute("href", "#section-regras-de-negocios");
  const indexLabels = (await index.locator("a").allTextContents()).map((label) => label.trim());
  expect(indexLabels.indexOf("Regras de Negócios")).toBeGreaterThan(
    indexLabels.indexOf("Fluxo 2 — Retorno Automático"),
  );
  const businessRules = page.locator("#section-regras-de-negocios");
  await expect(businessRules).toContainText("Documentar as regras de negócios que devem ser seguidas pelo distribuidor.");
  await expect(businessRules).toContainText("industry_abbreviation");
  await expect(businessRules).toContainText("a causa mais comum de pedidos duplicados e inconsistências de status");
  await expect(page.locator("#section-contexto")).toBeVisible();
  await expect(page.locator("#jornada-integracao")).toBeHidden();

  await productNav.getByRole("link", { name: "Jornada da Integração", exact: true }).click();
  await expect(index).toContainText("Jornada da Integração");
  await expect(index).toContainText("etapas expansíveis");
  await expect(index).not.toContainText("Contexto");
  await expect(page.locator("#section-contexto")).toBeHidden();
  await expect(page.locator("#jornada-integracao")).toBeVisible();
  await expect(page.locator("#tabelas-referencia")).toHaveCount(0);
  await expect(page.locator("#roteiro-integracao")).toBeHidden();
  const journeyItems = await index.locator("ul > li > a").allTextContents();
  expect(journeyItems[0].trim()).toBe("Jornada da Integração (etapas expansíveis)");
  await expect(index.getByRole("link", { name: "1. Autenticar (obter token)" }))
    .toHaveAttribute("href", "#jornada-operacao-1");

  await productNav.getByRole("link", { name: "Cenário de Teste", exact: true }).click();
  await expect(index).toContainText("Cenário de Teste");
  await expect(index.getByRole("link", { name: "Fluxo 1 — Retorno enviado pelo Distribuidor" })).toBeVisible();
  await expect(index.getByRole("link", { name: "Fluxo 2 — Retorno Automático" })).toBeVisible();
  await expect(index).not.toContainText("Jornada da Integração");
  await expect(index).not.toContainText("Tabelas de referência");
  await expect(page.locator("#section-contexto")).toBeHidden();
  await expect(page.locator("#jornada-integracao")).toBeHidden();
  await expect(page.locator("#tabelas-referencia")).toBeHidden();
  await expect(page.locator("#roteiro-integracao")).toBeVisible();

});

test("contextual index remains available in mobile navigation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  await page.goto("/docs/canal-autorizador#jornada-integracao");

  const quickNavigation = page.getByRole("navigation", { name: "Navegação rápida" });
  await expect(page.locator("footer")).toContainText("Funcional Health Tech");
  await expect(quickNavigation).toBeVisible();
  await expect(quickNavigation).toHaveClass(/docs-quick-nav/);

  await page.getByRole("button", { name: "Mostrar produtos" }).click();
  await expect(page.getByRole("navigation", { name: "Produtos EDI" }).getByRole("link", { name: "Cenário de Teste", exact: true })).toBeVisible();
});

test("quick navigation can be dragged horizontally", async ({ page }) => {
  await page.setViewportSize({ width: 1099, height: 898 });
  await login(page);
  await page.goto("/docs/canal-autorizador#jornada-integracao");

  const quickNavigation = page.getByRole("navigation", { name: "Navegação rápida" });
  await expect(quickNavigation).toBeVisible();
  const dimensions = await quickNavigation.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollLeft: element.scrollLeft,
    scrollWidth: element.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeGreaterThan(dimensions.clientWidth);

  const box = await quickNavigation.boundingBox();
  if (!box) throw new Error("Navegação rápida sem área visível para arraste");
  const y = box.y + box.height / 2;
  await page.mouse.move(box.x + box.width - 24, y);
  await page.mouse.down();
  await page.mouse.move(box.x + 24, y, { steps: 6 });
  await page.mouse.up();

  await expect.poll(() => quickNavigation.evaluate((element) => element.scrollLeft)).toBeGreaterThan(dimensions.scrollLeft);
});

test("admins can reach the existing request test from a selected flow", async ({ page }) => {
  await login(page, true);
  const nav = page.getByRole("navigation", { name: "Produtos EDI" });
  await nav.getByRole("link", { name: "Trade", exact: true }).click();
  await nav.getByRole("link", { name: /^IM/ }).click();
  const requestTest = nav.getByRole("link", { name: "Teste de Requisição", exact: true });
  await expect(requestTest).toHaveAttribute("href", "/docs/im/playground");
  await requestTest.click();
  await expect(page).toHaveURL("/docs/im/playground");
});

test("published product shows the complete flowchart and homologation manual", async ({ page }) => {
  await login(page);
  const nav = page.getByRole("navigation", { name: "Produtos EDI" });

  await nav.getByRole("link", { name: "Movimentação de Vidas", exact: true }).click();
  await expect(page).toHaveURL("/docs?produto=movimentacao-de-vidas");
  await nav.getByRole("button", { name: "Fluxograma Completo", exact: true }).click();
  const flowchartLink = page.locator('a[href="/fluxogramas/movimentacao-de-vidas"]');
  await expect(flowchartLink).toHaveCount(1);
  await flowchartLink.click();
  await expect(page).toHaveURL("/fluxogramas/movimentacao-de-vidas");
  await expect(page.getByRole("heading", { name: "Fluxo de Movimentação de Vidas" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Voltar à documentação", exact: true })).toHaveAttribute(
    "href",
    "/docs/movimentacao-de-vidas",
  );
  await expect(page.locator("header").first().getByRole("link", { name: "Documentação", exact: true })).toHaveAttribute(
    "href",
    "/docs/movimentacao-de-vidas",
  );
});

test("long subproduct pages expose a scroll-to-top control", async ({ page }) => {
  await login(page);
  await page.goto("/docs/canal-autorizador");
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

  const scrollTop = page.getByRole("button", { name: "Voltar ao topo" });
  await expect(scrollTop).toBeVisible();
  await scrollTop.click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(100);
});

test("long Markdown code examples stay within the page width", async ({ page }) => {
  await page.setViewportSize({ width: 1099, height: 898 });
  await login(page);
  await page.goto("/docs/canal-autorizador");

  await expect(page.locator("#section-seguranca-e-ferramentas pre").first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

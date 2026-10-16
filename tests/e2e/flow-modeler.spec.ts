import { expect, test, type Page } from "@playwright/test";

import type { IntegrationFlow } from "@/modules/fluxogramas/schema";

async function loginAsAdmin(page: Page) {
  await page.goto("/admin/projects");
  await expect(page).toHaveURL(/callbackUrl=%2Fadmin%2Fprojects/);
  await page.getByLabel("E-mail").fill("admin@funcionalcorp.com.br");
  await page.getByRole("button", { name: "Entrar (dev)" }).click();
  await expect(page).toHaveURL("/admin/projects");
}

test("carrega e preserva todos os fluxos no modelador BPMN", async ({ page }) => {
  await loginAsAdmin(page);

  for (const { slug, flowId } of [
    { slug: "canal-autorizador", flowId: "retorno-distribuidor" },
    { slug: "canal-autorizador", flowId: "retorno-automatico" },
    { slug: "credenciado-venda", flowId: "venda-bf" },
    { slug: "credenciado-venda", flowId: "venda-pbm" },
    { slug: "demo", flowId: "default" },
    { slug: "movimentacao-de-vidas", flowId: "default" },
    { slug: "wholesaler", flowId: "pedido-faturamento" },
  ]) {
    await page.goto(`/admin/projects/${slug}/flow?fluxo=${flowId}`);

    const before: IntegrationFlow = await page.evaluate(async ({ selectedSlug, selectedFlowId }) => {
      const response = await fetch(`/api/fluxogramas/${selectedSlug}?fluxo=${selectedFlowId}`);
      if (!response.ok) throw new Error(`Falha ao ler ${selectedSlug}/${selectedFlowId}`);
      return response.json();
    }, { selectedSlug: slug, selectedFlowId: flowId });

    await expect(page.getByTestId("bpmn-flow-editor")).toBeVisible();
    await expect(page.locator(".djs-palette")).toBeVisible();
    await expect(page.locator(".djs-container")).toBeVisible();
    await expect(page.getByRole("button", { name: "Salvar fluxograma" })).toBeEnabled();
    await page.getByRole("button", { name: "Salvar fluxograma" }).click();
    await expect(page.getByRole("status")).toHaveText("Fluxo salvo com sucesso.");

    const saved: IntegrationFlow = await page.evaluate(async ({ selectedSlug, selectedFlowId }) => {
      const response = await fetch(`/api/fluxogramas/${selectedSlug}?fluxo=${selectedFlowId}`);
      return response.json();
    }, { selectedSlug: slug, selectedFlowId: flowId });

    expect(saved.nodes).toHaveLength(before.nodes.length);
    expect(saved.edges).toHaveLength(before.edges.length);
    expect(saved.nodes.map(({ id, type, label, operationRef }) => ({ id, type, label, operationRef })))
      .toEqual(before.nodes.map(({ id, type, label, operationRef }) => ({ id, type, label, operationRef })));
    expect(saved.edges.map(({ id, source, target, label, sourceHandle, targetHandle }) => ({
      id,
      source,
      target,
      label,
      sourceHandle,
      targetHandle,
    }))).toEqual(before.edges.map(({ id, source, target, label, sourceHandle, targetHandle }) => ({
      id,
      source,
      target,
      label,
      sourceHandle,
      targetHandle,
    })));
    expect(saved.edges.every((edge: { waypoints?: Array<{ x: number; y: number }> }) =>
      (edge.waypoints?.length ?? 0) >= 2)).toBe(true);
    if (slug === "canal-autorizador") {
      expect(saved.nodes.some((node) => node.labelPosition)).toBe(true);
      expect(saved.edges.some((edge) => edge.label && edge.labelPosition)).toBe(true);
    }
    if (slug === "credenciado-venda" && flowId === "venda-bf") {
      expect(saved.annotations?.some((annotation) =>
        annotation.targetNodeId && (annotation.associationWaypoints?.length ?? 0) >= 2,
      )).toBe(true);
    }

    await page.reload();
    await expect(page.getByTestId("bpmn-flow-editor")).toBeVisible();
    await page.getByRole("button", { name: "Salvar fluxograma" }).click();
    await expect(page.getByRole("status")).toHaveText("Fluxo salvo com sucesso.");

    const savedAgain: IntegrationFlow = await page.evaluate(async ({ selectedSlug, selectedFlowId }) => {
      const response = await fetch(`/api/fluxogramas/${selectedSlug}?fluxo=${selectedFlowId}`);
      return response.json();
    }, { selectedSlug: slug, selectedFlowId: flowId });

    expect(savedAgain.nodes.map(({ id, position, labelPosition }) => ({ id, position, labelPosition })))
      .toEqual(saved.nodes.map(({ id, position, labelPosition }) => ({ id, position, labelPosition })));
    expect(savedAgain.edges.map(({ id, waypoints, labelPosition }) => ({ id, waypoints, labelPosition })))
      .toEqual(saved.edges.map(({ id, waypoints, labelPosition }) => ({ id, waypoints, labelPosition })));
    expect(savedAgain.lanes ?? []).toEqual(saved.lanes ?? []);
    expect(savedAgain.annotations ?? []).toEqual(saved.annotations ?? []);
  }

  await page.goto("/admin/projects/credenciado-venda/flow?fluxo=venda-bf");
  await page.getByRole("button", { name: "Exportar Mermaid" }).click();
  await expect(page.getByText("Mermaid exportado")).toBeVisible();
});

test("exibe todos os fluxos públicos pelo mesmo BPMN do editor", async ({ page }) => {
  await loginAsAdmin(page);

  for (const { slug, flowId } of [
    { slug: "canal-autorizador", flowId: "retorno-distribuidor" },
    { slug: "canal-autorizador", flowId: "retorno-automatico" },
    { slug: "credenciado-venda", flowId: "venda-bf" },
    { slug: "credenciado-venda", flowId: "venda-pbm" },
    { slug: "demo", flowId: "default" },
    { slug: "movimentacao-de-vidas", flowId: "default" },
    { slug: "wholesaler", flowId: "pedido-faturamento" },
  ]) {
    await page.goto(`/fluxogramas/${slug}?fluxo=${flowId}`);

    const viewer = page.getByTestId("bpmn-flow-viewer");
    await expect(viewer).toBeVisible();
    await expect(viewer.locator(".djs-container")).toBeVisible();
    await expect(viewer.locator(".djs-palette")).toHaveCount(0);
  }
});

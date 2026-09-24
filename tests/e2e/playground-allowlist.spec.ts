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

test("playground aceita query allowlisted e bloqueia fora da lista", async ({ page }) => {
  await loginAsDevAdmin(page);

  const allowlisted = await page.evaluate(async () => {
    const response = await fetch("/api/living-docs/projects/demo/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: 'mutation { createToken(login: "demo", password: "demo") { token } }',
      }),
    });
    return { status: response.status };
  });

  expect(allowlisted.status).not.toBe(403);
  expect([200, 400, 409, 502]).toContain(allowlisted.status);

  const blocked = await page.evaluate(async () => {
    const response = await fetch("/api/living-docs/projects/demo/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "query { operationOutsideAllowlist { id } }" }),
    });
    const body = (await response.json()) as { error?: string };
    return { status: response.status, error: body.error ?? "" };
  });

  expect(blocked.status).toBe(403);
  expect(blocked.error).toContain("allowlist");
});

test("distribuidor recebe forbidden na API do playground", async ({ page }) => {
  await loginAsDevUser(page);

  const response = await page.evaluate(async () => {
    const res = await fetch("/api/living-docs/projects/demo/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: 'mutation { createToken(login: "demo", password: "demo") { token } }',
      }),
    });
    const body = (await res.json()) as { error?: string };
    return { status: res.status, error: body.error ?? "" };
  });

  expect(response.status).toBe(403);
  expect(response.error).toBe("Forbidden");
});

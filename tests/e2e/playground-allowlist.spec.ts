import { expect, test, type Page } from "@playwright/test";

async function loginAsDevUser(page: Page) {
  await page.goto("/");
  await page.getByLabel("E-mail").fill("qa-distribuidor@fidelize.com.br");
  await page.getByRole("button", { name: "Entrar (dev)" }).click();
  await expect(page.getByRole("button", { name: "Sair" })).toBeVisible();
}

test("playground aceita query allowlisted e bloqueia fora da lista", async ({ page }) => {
  await loginAsDevUser(page);

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

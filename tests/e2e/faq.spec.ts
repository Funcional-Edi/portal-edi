import { expect, test, type Page } from "@playwright/test";

async function login(page: Page) {
  await page.goto("/");
  await page.getByLabel("E-mail").fill("qa@distribuidor.com");
  await page.getByRole("button", { name: "Entrar (dev)" }).click();
  await expect(page.getByRole("button", { name: "Sair" })).toBeVisible();
}

test("cliente acessa o FAQ, filtra e expande uma resposta", async ({ page }) => {
  await login(page);
  await page.goto("/");
  await expect(page.getByRole("link", { name: /FAQ de Integração/ })).toHaveAttribute("href", "/faq");

  await page.goto("/faq");

  await expect(page).toHaveURL("/faq");
  await expect(page.getByRole("heading", { name: "FAQ de Integração" })).toBeVisible();
  await expect(page.getByRole("link", { name: "FAQ", exact: true })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(page.getByText("Por onde começo a integração?", { exact: true })).toBeVisible();

  await page.getByLabel("Categoria").selectOption({ label: "Canal Autorizador" });
  await expect(page.getByText("O que devo consultar para integrar o Canal Autorizador?", { exact: true })).toBeVisible();
  await expect(page.getByText("Por onde começo a integração?", { exact: true })).toHaveCount(0);

  await page.getByText("O que devo consultar para integrar o Canal Autorizador?", { exact: true }).click();
  await expect(page.getByText(/ciclo do.*Transfer Order/i)).toBeVisible();
});

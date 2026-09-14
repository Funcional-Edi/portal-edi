/**
 * Conecta um projeto REST (protocolo `rest`, ex.: PSP) à API real do produto.
 *
 * Diferente de `connect-gateway.ts` (GraphQL), aqui **não há verificação
 * automática de credenciais**: o portal não conhece o endpoint de login/token
 * de cada API REST legada, e inventar uma chamada de autenticação seria
 * arriscado (poderia bloquear a conta, ou simplesmente validar contra o
 * endpoint errado). As credenciais são cifradas e gravadas da mesma forma
 * que no fluxo GraphQL; a validação real acontece na primeira chamada feita
 * pelo distribuidor/admin.
 *
 * Fluxo: valida entrada → valida URL (anti-SSRF, `core/security/gateway-url`)
 * → confirma que o projeto existe e é `protocol: "rest"` → cifra e grava as
 * credenciais → atualiza `config.json` (`apiBaseUrl`) → invalida cache.
 */

import { revalidateTag } from "next/cache";

import { GatewayUrlError, validateGatewayUrl } from "@/core/security/gateway-url";
import { connectApiInputSchema } from "@/modules/living-docs-externa/schema/project";
import {
  getProject,
  updateProjectApiConfig,
} from "@/modules/living-docs-externa/repository/project-repository";
import { saveGatewayCredentials } from "@/modules/living-docs-externa/services/gateway-credentials";
import { LIVING_DOCS_CACHE_TAGS } from "@/modules/living-docs-externa/services/cache-tags";
import type { ProjectConfig } from "@/modules/living-docs-externa/schema/project";

export type ConnectApiErrorCode =
  | "VALIDATION"
  | "INVALID_URL"
  | "PROJECT_NOT_FOUND"
  | "WRONG_PROTOCOL";

export class ConnectApiError extends Error {
  constructor(
    public readonly code: ConnectApiErrorCode,
    message: string
  ) {
    super(message);
    this.name = "ConnectApiError";
  }
}

export async function connectApi(slug: string, input: unknown): Promise<ProjectConfig> {
  const parsed = connectApiInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new ConnectApiError("VALIDATION", parsed.error.message);
  }

  let validatedUrl: URL;
  try {
    validatedUrl = validateGatewayUrl(parsed.data.apiBaseUrl);
  } catch (error) {
    if (error instanceof GatewayUrlError) {
      throw new ConnectApiError("INVALID_URL", error.message);
    }
    throw error;
  }

  const project = await getProject(slug);
  if (!project) {
    throw new ConnectApiError("PROJECT_NOT_FOUND", `Projeto "${slug}" não encontrado.`);
  }

  if (project.config.protocol !== "rest") {
    throw new ConnectApiError(
      "WRONG_PROTOCOL",
      `Projeto "${slug}" não está configurado como REST — use "Conectar gateway" (GraphQL).`
    );
  }

  await saveGatewayCredentials(slug, {
    login: parsed.data.login,
    password: parsed.data.password,
  });

  const config = await updateProjectApiConfig(slug, {
    apiBaseUrl: validatedUrl.toString(),
  });

  revalidateTag(LIVING_DOCS_CACHE_TAGS.projects);
  revalidateTag(LIVING_DOCS_CACHE_TAGS.project(slug));

  return config;
}

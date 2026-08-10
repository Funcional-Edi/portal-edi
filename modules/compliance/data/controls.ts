/**
 * Catálogo de controles de segurança e compliance.
 *
 * Ao implementar um novo controle, adicione uma entrada aqui — o dashboard
 * em `/compliance` reflete automaticamente este catálogo + status em runtime.
 */

export type ComplianceCategory =
  | "confidencialidade"
  | "integridade"
  | "autenticacao"
  | "autorizacao"
  | "operacional";

export type ComplianceControlStatus = "ativo" | "parcial" | "pendente";

export interface ComplianceControl {
  id: string;
  title: string;
  category: ComplianceCategory;
  status: ComplianceControlStatus;
  /** O que foi implementado e por quê. */
  description: string;
  /** Como verificar (comando, rota ou arquivo). */
  verification: string;
  /** Referência no código ou doc. */
  reference: string;
  implementedAt: string;
}

export const COMPLIANCE_CONTROLS: ComplianceControl[] = [
  {
    id: "secrets-server-side",
    title: "Segredos somente server-side",
    category: "confidencialidade",
    status: "ativo",
    description:
      "Nenhuma variável NEXT_PUBLIC_* expõe chaves ou tokens. Toda leitura de env passa por core/config/env.ts.",
    verification: "grep NEXT_PUBLIC_ no projeto — deve retornar vazio.",
    reference: "core/config/env.ts",
    implementedAt: "2026-03-10",
  },
  {
    id: "gitignore-secrets",
    title: "Arquivos sensíveis fora do Git",
    category: "confidencialidade",
    status: "ativo",
    description:
      ".env.local, credentials.enc e permissions.json estão no .gitignore — segredos e RBAC não vão para o repositório.",
    verification: "Conferir .gitignore linhas 17–24.",
    reference: ".gitignore",
    implementedAt: "2026-03-10",
  },
  {
    id: "sso-no-password-persist",
    title: "Senha SSO nunca persistida",
    category: "confidencialidade",
    status: "ativo",
    description:
      "Login via mutation createToken no SSO; a senha é validada e descartada — só a sessão JWT fica no cookie httpOnly.",
    verification: "core/auth/sso.ts — sem gravação de senha em disco ou log.",
    reference: "core/auth/sso.ts",
    implementedAt: "2026-03-10",
  },
  {
    id: "gateway-credentials-encrypted",
    title: "Credenciais do gateway cifradas (AES-256-GCM)",
    category: "confidencialidade",
    status: "ativo",
    description:
      "Login/senha do gateway são cifrados com chave derivada de AUTH_SECRET e gravados em credentials.enc — nunca retornam ao browser.",
    verification: "modules/living-docs-externa/services/gateway-credentials.ts",
    reference: "data/**/credentials.enc",
    implementedAt: "2026-03-10",
  },
  {
    id: "jwt-session-8h",
    title: "Sessão JWT com expiração de 8 horas",
    category: "autenticacao",
    status: "ativo",
    description: "Cookie httpOnly com maxAge de 8h — limita janela de uso de sessão comprometida.",
    verification: "core/auth/config.ts — session.maxAge",
    reference: "core/auth/config.ts",
    implementedAt: "2026-03-10",
  },
  {
    id: "sso-rate-limit",
    title: "Rate limit no login SSO (10 / 15 min)",
    category: "autenticacao",
    status: "ativo",
    description:
      "Proteção contra força bruta por e-mail. Redis REST opcional para durabilidade entre instâncias.",
    verification: "core/auth/rate-limit.ts + ADR-0007",
    reference: "core/auth/sso.ts",
    implementedAt: "2026-03-10",
  },
  {
    id: "dev-auth-restricted",
    title: "Login dev restrito a development",
    category: "autenticacao",
    status: "ativo",
    description:
      "DEV_AUTH_ENABLED só funciona com NODE_ENV=development; validateEnv bloqueia em produção. Rate limit também aplicado.",
    verification: "validateEnv() + core/auth/config.ts",
    reference: ".env.example",
    implementedAt: "2026-08-10",
  },
  {
    id: "rbac-permissions-file",
    title: "RBAC configurável (permissions.json)",
    category: "autorizacao",
    status: "ativo",
    description:
      "Admins e clients definidos em data/permissions.json (gitignored) ou PERMISSIONS_CONFIG_JSON. Defaults em código usam placeholders genéricos.",
    verification: "Copiar permissions.example.json → permissions.json no deploy.",
    reference: "data/permissions.example.json",
    implementedAt: "2026-08-10",
  },
  {
    id: "middleware-rbac",
    title: "RBAC no middleware (páginas + API)",
    category: "autorizacao",
    status: "ativo",
    description:
      "Rotas de módulo protegidas por papel. /api/* exige sessão exceto /api/auth e /api/health (defesa em profundidade).",
    verification: "middleware.ts matcher inclui /api/:path*",
    reference: "middleware.ts",
    implementedAt: "2026-08-10",
  },
  {
    id: "playground-admin-only",
    title: "Playground GraphQL restrito a admin",
    category: "autorizacao",
    status: "ativo",
    description:
      "Proxy do playground usa credencial do gateway server-side; apenas admins podem executar mutations no gateway real.",
    verification: "POST /api/living-docs/projects/[slug]/graphql exige isAdminRole",
    reference: "app/api/living-docs/projects/[slug]/graphql/route.ts",
    implementedAt: "2026-08-10",
  },
  {
    id: "playground-allowlist",
    title: "Allowlist de operações no playground",
    category: "integridade",
    status: "ativo",
    description:
      "Somente queries/mutations documentadas no manual; introspection e subscriptions bloqueadas.",
    verification: "modules/living-docs-externa/services/playground-allowlist.ts",
    reference: "playground-allowlist.ts",
    implementedAt: "2026-03-10",
  },
  {
    id: "gateway-ssrf",
    title: "Anti-SSRF em URLs de gateway",
    category: "integridade",
    status: "ativo",
    description:
      "Bloqueia localhost e IPs privados em produção; GATEWAY_URL_ALLOWED_HOSTS restringe hosts permitidos.",
    verification: "core/security/gateway-url.ts + GATEWAY_URL_ALLOWED_HOSTS no .env",
    reference: "core/security/gateway-url.ts",
    implementedAt: "2026-08-10",
  },
  {
    id: "security-headers",
    title: "Headers HTTP de segurança",
    category: "operacional",
    status: "ativo",
    description:
      "CSP, X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy e Permissions-Policy configurados globalmente.",
    verification: "next.config.mjs — headers()",
    reference: "next.config.mjs",
    implementedAt: "2026-08-10",
  },
  {
    id: "health-minimal-public",
    title: "Health endpoint com resposta mínima pública",
    category: "confidencialidade",
    status: "ativo",
    description:
      "GET /api/health sem sessão admin retorna só status e timestamp — sem topologia interna.",
    verification: "curl /api/health sem cookie vs com sessão admin",
    reference: "app/api/health/route.ts",
    implementedAt: "2026-08-10",
  },
  {
    id: "mutation-origin-check",
    title: "Validação de Origin em mutações sensíveis",
    category: "integridade",
    status: "ativo",
    description:
      "POST de connect e playground validam Origin/Referer contra AUTH_URL — mitiga CSRF cross-site.",
    verification: "core/security/request-origin.ts",
    reference: "core/security/request-origin.ts",
    implementedAt: "2026-08-10",
  },
  {
    id: "open-redirect-protection",
    title: "Proteção contra open redirect",
    category: "integridade",
    status: "ativo",
    description: "callbackUrl pós-login aceita só paths relativos internos.",
    verification: "core/auth/module-access.ts — isSafeCallbackUrl",
    reference: "core/auth/module-access.ts",
    implementedAt: "2026-03-10",
  },
  {
    id: "ai-guardrails",
    title: "Guardrails de IA (redação de segredos)",
    category: "confidencialidade",
    status: "ativo",
    description:
      "Entrada sanitizada antes de enviar ao provedor; budget mensal configurável; chaves só server-side.",
    verification: "core/ai/guardrails.ts + AI_MONTHLY_BUDGET_USD",
    reference: "core/ai/",
    implementedAt: "2026-03-10",
  },
  {
    id: "export-publish-filter",
    title: "Export respeita estado de publicação",
    category: "confidencialidade",
    status: "ativo",
    description: "Clientes só exportam manuais publicados; rascunhos ficam restritos a admin.",
    verification: "resolve-project-for-export.ts",
    reference: "modules/living-docs-externa/services/",
    implementedAt: "2026-03-10",
  },
  {
    id: "cursor-security-rule",
    title: "Regra Cursor — alerta imediato de risco",
    category: "operacional",
    status: "ativo",
    description:
      "IA do projeto deve parar e alertar ao detectar vazamento de segredos, bypass de auth ou exposição de PII.",
    verification: ".cursor/rules/seguranca-dados.mdc",
    reference: ".cursor/rules/seguranca-dados.mdc",
    implementedAt: "2026-08-10",
  },
];

export const COMPLIANCE_CATEGORY_LABELS: Record<ComplianceCategory, string> = {
  confidencialidade: "Confidencialidade",
  integridade: "Integridade",
  autenticacao: "Autenticação",
  autorizacao: "Autorização",
  operacional: "Operacional",
};

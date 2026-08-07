# `core/ui/` — Casca visual compartilhada

Fundação de UI do portal. **Não** contém regra de negócio de módulo —
só peças reutilizadas por `app/` e por `modules/*/ui/`.

| Arquivo | Responsabilidade |
|---------|------------------|
| `app-shell.tsx` | `AppHeader` + `AppShell` — marca, subtítulo, nav, slot de ações |
| `badge.tsx` | Badge com tons semânticos (`brand`, `neutral`, `success`, `warning`) |
| `session-actions.tsx` | Entrar / e-mail + Sair (Server Component; usa `core/auth`) |

## Por que mora em `core/`

1. Home, login, leitor e admin precisam do **mesmo** header.
2. Se ficasse em `modules/living-docs-externa`, outros módulos não poderiam
   importar (regra: módulos não se importam).
3. `core/` já é o lugar da fundação (auth, config, events…). UI de casca é
   fundação visual — ver [ADR-0010](../../docs/arquitetura/adr/0010-ui-shell-compartilhado.md).

## Como usar

```tsx
import { AppShell } from "@/core/ui/app-shell";
import { SessionActions } from "@/core/ui/session-actions";

<AppShell
  subtitle="Fundação modular"
  navItems={[{ href: "/manual", label: "Documentação Viva" }]}
  actions={<SessionActions />}
>
  {children}
</AppShell>
```

Telas com layout próprio (sidebar + TOC) usam só `AppHeader`:

```tsx
import { AppHeader } from "@/core/ui/app-shell";

<AppHeader subtitle="Documentação viva" actions={<SessionActions />} />
```

## O que NÃO colocar aqui

- Formulários de domínio (connect gateway, editor de operação…)
- Tokens/cores de um módulo específico
- Componentes que importam de `modules/`

# Onboarding EDI — Portal de Integração

Guia rápido para o time EDI operar o portal modular.

## Papéis

- **Admin (EDI):** cria projetos, conecta gateway, cura manual, publica.
- **Client (distribuidor):** lê manuais publicados e usa o playground allowlisted.

## Fluxo típico de um manual novo

1. Criar slug em `/admin/projects/new`.
2. Conectar gateway homolog e sincronizar schema.
3. Curar operações e seções no editor unificado (`/admin/projects/[slug]/edit`).
4. Validar checklist de qualidade e publicar.
5. Distribuidor acessa `/manual/[slug]`.

## Onde ficam os arquivos

| Artefato | Caminho |
|----------|---------|
| Config do projeto | `content/projects/{slug}/config.json` |
| Manual curado | `content/projects/{slug}/manual.json` |
| Seções Markdown | `content/projects/{slug}/sections/*.md` |
| Schema introspection | `data/projects/{slug}/schema.json` |
| Credenciais gateway | `data/projects/{slug}/credentials.enc` (gitignored) |

## Comandos úteis

```bash
npm run dev      # http://localhost:3002
npm run ci       # gate completo antes de PR
```

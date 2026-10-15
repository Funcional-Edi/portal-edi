import { readContentJson, writeContentJson } from "@/core/db/adapters";

export const ACCESS_AUDIT_PATH = "data/access/audit-log.json";
const ACCESS_AUDIT_BRANCH = "portal-state";
const MAX_AUDIT_EVENTS = 500;

export type AccessAuditAction =
  | "local_login_success"
  | "access_granted"
  | "access_revoked"
  | "sso_url_updated";

export interface AccessAuditEvent {
  action: AccessAuditAction;
  actorEmail: string;
  targetEmail?: string;
  detail?: string;
  occurredAt: string;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function listAccessAuditEvents(): Promise<AccessAuditEvent[]> {
  const entries = await readContentJson<unknown>(ACCESS_AUDIT_PATH, { ref: ACCESS_AUDIT_BRANCH });
  if (!Array.isArray(entries)) return [];

  return entries
    .filter((entry): entry is AccessAuditEvent => {
      if (!entry || typeof entry !== "object") return false;
      const action = (entry as { action?: unknown }).action;
      const actorEmail = (entry as { actorEmail?: unknown }).actorEmail;
      const occurredAt = (entry as { occurredAt?: unknown }).occurredAt;
      return (
        typeof action === "string" &&
        typeof actorEmail === "string" &&
        typeof occurredAt === "string"
      );
    })
    .slice(0, MAX_AUDIT_EVENTS);
}

export async function appendAccessAuditEvent(event: {
  action: AccessAuditAction;
  actorEmail: string;
  targetEmail?: string;
  detail?: string;
  occurredAt?: string;
}): Promise<void> {
  const now = event.occurredAt ?? new Date().toISOString();
  const current = await listAccessAuditEvents();
  const next: AccessAuditEvent[] = [
    {
      action: event.action,
      actorEmail: normalizeEmail(event.actorEmail),
      targetEmail: event.targetEmail ? normalizeEmail(event.targetEmail) : undefined,
      detail: event.detail,
      occurredAt: now,
    },
    ...current,
  ].slice(0, MAX_AUDIT_EVENTS);

  await writeContentJson(ACCESS_AUDIT_PATH, next, {
    branch: ACCESS_AUDIT_BRANCH,
    message: "chore(acesso): registra auditoria de acesso",
  });
}

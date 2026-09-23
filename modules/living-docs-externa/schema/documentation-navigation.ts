import type { UserRole } from "@/core/auth/roles";
import type { ManualOperationKind } from "@/modules/living-docs-externa/schema/manual";

export type DocumentationStatus = "published" | "no-documentation" | "development" | "unavailable";

/** Future claims must come from a verified server session, never from the browser. */
export interface DocumentationAudience {
  role?: UserRole;
  userId?: string;
  organizationId?: string;
  clientId?: string;
  permissions?: readonly string[];
}

export interface DocumentationAccess {
  requiredPermission?: string;
  roles?: readonly UserRole[];
  userIds?: readonly string[];
  organizationIds?: readonly string[];
  clientIds?: readonly string[];
}

export interface DocumentationItem {
  id: string;
  label: string;
  order: number;
  enabled: boolean;
  visible: boolean;
  status: DocumentationStatus;
  /** Optional editorial tag; availability and environment are always shown separately. */
  tag?: string;
  access?: DocumentationAccess;
}

export interface DocumentationModule extends DocumentationItem {
  projectSlug?: string;
  route: string | null;
}

export interface DocumentationAction extends DocumentationItem {
  destination: "documentation" | "guide" | "flowchart" | "request-test" | null;
  linkModules?: boolean;
}

export interface DocumentationProduct extends DocumentationItem {
  description: string;
  modules: readonly DocumentationModule[];
  actions: readonly DocumentationAction[];
}

export interface DocumentationConfiguration {
  products: readonly DocumentationProduct[];
  clients?: DocumentationItem;
}

/** Only presentation data crosses the server/client boundary. */
export interface DocumentationLinkView {
  id: string;
  label: string;
  href: string | null;
  projectSlug?: string;
  environment?: string;
  status: DocumentationStatus;
  tag?: string;
  operations?: DocumentationOperationView[];
}

export interface DocumentationOperationView {
  kind: ManualOperationKind;
  name: string;
  label: string;
  method?: string;
  href: string;
}

export interface DocumentationActionView {
  id: string;
  label: string;
  tag?: string;
  status: DocumentationStatus;
  links: DocumentationLinkView[];
}

export interface DocumentationProductView {
  id: string;
  label: string;
  description: string;
  tag?: string;
  status: DocumentationStatus;
  actions: DocumentationActionView[];
}

export interface DocumentationNavigationView {
  products: DocumentationProductView[];
  clients?: Pick<DocumentationItem, "id" | "label" | "status" | "tag">;
}

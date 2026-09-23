import { NextResponse } from "next/server";

import { auth, isAdminRole } from "@/core/auth";
import {
  CatalogProductError,
  updateCatalogProduct,
} from "@/modules/living-docs-externa/services/manage-catalog-products";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.role || !isAdminRole(session.user.role)) return null;
  return session;
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  try {
    const product = await updateCatalogProduct(id, body);
    return NextResponse.json(product);
  } catch (error) {
    if (error instanceof CatalogProductError) {
      const status = error.code === "NOT_FOUND" ? 404 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }
    throw error;
  }
}

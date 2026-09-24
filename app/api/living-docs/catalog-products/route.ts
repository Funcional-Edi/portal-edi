import { NextResponse } from "next/server";

import { auth, isAdminRole } from "@/core/auth";
import { listCatalogProducts } from "@/modules/living-docs-externa/repository/catalog-product-repository";
import {
  CatalogProductError,
  createCatalogProduct,
} from "@/modules/living-docs-externa/services/manage-catalog-products";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.role || !isAdminRole(session.user.role)) return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return NextResponse.json(await listCatalogProducts());
}

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  try {
    const product = await createCatalogProduct(body);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    if (error instanceof CatalogProductError) {
      const status = error.code === "ALREADY_EXISTS" ? 409 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }
    throw error;
  }
}

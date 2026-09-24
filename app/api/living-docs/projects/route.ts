import { NextResponse } from "next/server";

import { auth, isAdminRole } from "@/core/auth";
import {
  CreateProjectError,
  createProject,
} from "@/modules/living-docs-externa/services/create-project";
import { linkProjectToCatalogProduct } from "@/modules/living-docs-externa/services/manage-catalog-products";
import { ConnectGatewayError, connectGateway } from "@/modules/living-docs-externa/services/connect-gateway";
import { SyncSchemaError, syncSchema } from "@/modules/living-docs-externa/services/sync-schema";
import { listProjects } from "@/modules/living-docs-externa/services/list-projects";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.role || !isAdminRole(session.user.role)) {
    return null;
  }
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const projects = await listProjects();
  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const raw = body as {
    protocol?: string;
    graphqlUrl?: string;
    login?: string;
    password?: string;
  };
  const discover = raw.protocol !== "rest" && Boolean(raw.graphqlUrl?.trim() && raw.login?.trim() && raw.password);

  let project;
  try {
    project = await createProject(body);
  } catch (error) {
    if (error instanceof CreateProjectError) {
      const status = error.code === "ALREADY_EXISTS" ? 409 : error.code === "PRODUCT_NOT_FOUND" ? 404 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }
    throw error;
  }

  if (project.config.productId) {
    await linkProjectToCatalogProduct(project.config.productId, {
      slug: project.config.slug,
      name: project.config.name,
    });
  }

  if (!discover) {
    return NextResponse.json({ slug: project.config.slug, name: project.config.name }, { status: 201 });
  }

  try {
    await connectGateway(project.config.slug, {
      graphqlUrl: raw.graphqlUrl,
      login: raw.login,
      password: raw.password,
    });
    const synced = await syncSchema(project.config.slug);
    return NextResponse.json(
      {
        slug: project.config.slug,
        name: project.config.name,
        queryFieldCount: synced.queryFieldCount,
        mutationFieldCount: synced.mutationFieldCount,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ConnectGatewayError || error instanceof SyncSchemaError) {
      return NextResponse.json(
        {
          error: `${error.message} O projeto foi criado; ajuste a URL ou o acesso e tente de novo na ficha do projeto.`,
          slug: project.config.slug,
        },
        { status: 400 },
      );
    }
    throw error;
  }
}

import { NextResponse } from "next/server";

import { auth, isAdminRole } from "@/core/auth";
import {
  CreateProjectError,
  createProject,
} from "@/modules/living-docs-externa/services/create-project";
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

  try {
    const project = await createProject(body);
    return NextResponse.json(
      { slug: project.config.slug, name: project.config.name },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof CreateProjectError) {
      const status = error.code === "ALREADY_EXISTS" ? 409 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }
    throw error;
  }
}

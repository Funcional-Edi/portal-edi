import { NextResponse } from "next/server";

import { auth, isAdminRole } from "@/core/auth";
import { getPlaygroundMetricsSnapshot } from "@/core/metrics/playground-metrics-store";

/** Métricas agregadas do playground (somente admin). */
export async function GET() {
  const session = await auth();
  if (!session?.user?.role || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(getPlaygroundMetricsSnapshot());
}

import { NextResponse } from "next/server";

import { requireAdmin } from "@/core/auth/require-role";
import { getPlaygroundMetricsSnapshot } from "@/core/metrics/playground-metrics-store";

/** Métricas agregadas do playground (somente admin). */
export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(getPlaygroundMetricsSnapshot());
}

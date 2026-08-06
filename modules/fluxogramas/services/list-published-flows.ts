import { cache } from "react";

import { listPublishedFlowSummaries } from "@/modules/fluxogramas/repository/flow-repository";
import type { PublishedFlowSummary } from "@/modules/fluxogramas/repository/flow-repository";

async function loadPublishedFlows(): Promise<PublishedFlowSummary[]> {
  return listPublishedFlowSummaries();
}

/** Fluxos publicados com `flow.json` existente. */
export const listPublishedFlows = cache(loadPublishedFlows);

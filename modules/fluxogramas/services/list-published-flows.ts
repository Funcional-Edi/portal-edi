import { listPublishedFlowSummaries } from "@/modules/fluxogramas/repository/flow-repository";
import type { PublishedFlowSummary } from "@/modules/fluxogramas/repository/flow-repository";
import { cache } from "react";

/** Fluxos publicados com `flow.json` existente. */
export const listPublishedFlows = cache(
  (): Promise<PublishedFlowSummary[]> => listPublishedFlowSummaries()
);

export type PlaygroundOperationKind = "query" | "mutation";

export interface PlaygroundMetricEvent {
  slug: string;
  operationKind: PlaygroundOperationKind;
  operationName: string;
  timestamp: string;
  success: boolean;
}

export interface PlaygroundOperationAggregate {
  slug: string;
  operationKind: PlaygroundOperationKind;
  operationName: string;
  total: number;
  last24h: number;
  lastExecutedAt: string | null;
}

export interface PlaygroundProjectAggregate {
  slug: string;
  total: number;
  last24h: number;
}

export interface PlaygroundMetricsSnapshot {
  totalExecutions: number;
  last24hExecutions: number;
  byOperation: PlaygroundOperationAggregate[];
  byProject: PlaygroundProjectAggregate[];
  recent: PlaygroundMetricEvent[];
}

const MS_24H = 24 * 60 * 60 * 1000;

let events: PlaygroundMetricEvent[] = [];

function isWithinLast24h(isoTimestamp: string, now = Date.now()): boolean {
  return now - new Date(isoTimestamp).getTime() <= MS_24H;
}

/** Registra execução bem-sucedida do playground (MVP in-memory — ADR-0002). */
export function recordPlaygroundExecution(input: {
  slug: string;
  operationKind: PlaygroundOperationKind;
  operationName: string;
  success?: boolean;
  timestamp?: string;
}): void {
  events.push({
    slug: input.slug,
    operationKind: input.operationKind,
    operationName: input.operationName,
    timestamp: input.timestamp ?? new Date().toISOString(),
    success: input.success ?? true,
  });
}

/** Agrega contadores por operação, projeto e janela 24h. */
export function getPlaygroundMetricsSnapshot(limitRecent = 50): PlaygroundMetricsSnapshot {
  const now = Date.now();
  const successful = events.filter((event) => event.success);

  const operationMap = new Map<string, PlaygroundOperationAggregate>();
  const projectMap = new Map<string, PlaygroundProjectAggregate>();

  for (const event of successful) {
    const opKey = `${event.slug}:${event.operationKind}:${event.operationName}`;
    const existingOp = operationMap.get(opKey) ?? {
      slug: event.slug,
      operationKind: event.operationKind,
      operationName: event.operationName,
      total: 0,
      last24h: 0,
      lastExecutedAt: null,
    };
    existingOp.total += 1;
    if (isWithinLast24h(event.timestamp, now)) existingOp.last24h += 1;
    if (
      !existingOp.lastExecutedAt ||
      event.timestamp > existingOp.lastExecutedAt
    ) {
      existingOp.lastExecutedAt = event.timestamp;
    }
    operationMap.set(opKey, existingOp);

    const project = projectMap.get(event.slug) ?? {
      slug: event.slug,
      total: 0,
      last24h: 0,
    };
    project.total += 1;
    if (isWithinLast24h(event.timestamp, now)) project.last24h += 1;
    projectMap.set(event.slug, project);
  }

  const byOperation = [...operationMap.values()].sort(
    (a, b) => b.total - a.total
  );
  const byProject = [...projectMap.values()].sort((a, b) => b.total - a.total);

  return {
    totalExecutions: successful.length,
    last24hExecutions: successful.filter((e) => isWithinLast24h(e.timestamp, now))
      .length,
    byOperation,
    byProject,
    recent: [...successful].slice(-limitRecent).reverse(),
  };
}

/** Limpa store — apenas para testes. */
export function resetPlaygroundMetricsStore(): void {
  events = [];
}

/** Filtra métricas de um projeto específico. */
export function getPlaygroundMetricsForSlug(
  slug: string
): PlaygroundMetricsSnapshot {
  const filtered = events.filter((event) => event.slug === slug && event.success);
  const previous = events;
  events = filtered;
  try {
    return getPlaygroundMetricsSnapshot();
  } finally {
    events = previous;
  }
}

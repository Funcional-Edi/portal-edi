export const FLOW_LAYOUT_DEFAULTS = {
  columnGap: 320,
  edgeColor: "#0f766e",
  edgeOffset: 24,
  edgeStrokeWidth: 1.5,
  edgeType: "step" as const,
  endPosition: { x: 340, y: 160 },
  newNodePosition: { x: 80, y: 160 },
  snapGrid: [20, 20] as [number, number],
  startPosition: { x: 80, y: 160 },
} as const;

/** Posiciona inclusões na próxima coluna livre; a curadoria manual prevalece. */
export function nextLinearNodePosition(
  nodes: ReadonlyArray<{ position: { x: number; y: number } }>
): { x: number; y: number } {
  const rightmost = nodes.reduce(
    (maximum, node) => Math.max(maximum, node.position.x),
    FLOW_LAYOUT_DEFAULTS.newNodePosition.x - FLOW_LAYOUT_DEFAULTS.columnGap
  );

  return {
    x: rightmost + FLOW_LAYOUT_DEFAULTS.columnGap,
    y: FLOW_LAYOUT_DEFAULTS.newNodePosition.y,
  };
}

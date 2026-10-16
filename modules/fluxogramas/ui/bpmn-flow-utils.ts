import type {
  FlowAnnotation,
  FlowEdge,
  FlowLane,
  FlowNode,
  FlowNodeType,
  IntegrationFlow,
} from "@/modules/fluxogramas/schema";

const BPMN_DI_NS = "http://www.omg.org/spec/BPMN/20100524/DI";
const BPMN_DD_DI_NS = "http://www.omg.org/spec/DD/20100524/DI";
const BPMN_DC_NS = "http://www.omg.org/spec/DD/20100524/DC";
const BPMN_MODEL_NS = "http://www.omg.org/spec/BPMN/20100524/MODEL";

type BpmnBusinessObject = {
  $type?: string;
  id?: string;
  name?: string;
  text?: string;
  sourceRef?: { id?: string };
  targetRef?: { id?: string };
  $attrs?: Record<string, unknown>;
};

export type BpmnElementLike = {
  id: string;
  type?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  waypoints?: Array<{ x: number; y: number }>;
  labelTarget?: { id?: string };
  businessObject?: BpmnBusinessObject;
};

export type BpmnModelerLike = {
  get(name: string): unknown;
  importXML(xml: string): Promise<{ warnings: string[] }>;
  saveXML(options?: { format?: boolean }): Promise<{ xml?: string; error?: Error }>;
  on(event: string, callback: () => void): void;
  destroy(): void;
};

type FlowMeta = Pick<IntegrationFlow, "version" | "title" | "description">;

const nodeDimensions: Record<FlowNodeType, { width: number; height: number }> = {
  start: { width: 36, height: 36 },
  operation: { width: 240, height: 80 },
  decision: { width: 60, height: 60 },
  box: { width: 240, height: 80 },
  text: { width: 240, height: 80 },
  end: { width: 36, height: 36 },
};

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function safeXmlId(value: string): string {
  const safe = value.replace(/[^A-Za-z0-9_.-]/g, "_");
  return /^[A-Za-z_]/.test(safe) ? safe : `id_${safe}`;
}

function customAttributes(values: Record<string, string | undefined>): string {
  return Object.entries(values)
    .filter(([, value]) => value !== undefined && value !== "")
    .map(([key, value]) => ` ${key}="${escapeXml(value!)}"`)
    .join("");
}

function bpmnNodeType(node: FlowNode): string {
  if (node.type === "start") return "startEvent";
  if (node.type === "end") return "endEvent";
  if (node.type === "decision") return "exclusiveGateway";
  return "task";
}

function shapeBounds(node: FlowNode) {
  return {
    x: node.position.x,
    y: node.position.y,
    ...nodeDimensions[node.type],
  };
}

type Point = { x: number; y: number };
type LabelPosition = Point & { width: number; height: number };

function labelPosition(element: BpmnElementLike): LabelPosition | undefined {
  const { x, y, width, height } = element;
  return typeof x === "number" && typeof y === "number" && typeof width === "number" && typeof height === "number" && width > 0 && height > 0
    ? { x, y, width, height }
    : undefined;
}

function bpmnLabelXml(position: LabelPosition | undefined): string {
  return position
    ? `<bpmndi:BPMNLabel><dc:Bounds x="${position.x}" y="${position.y}" width="${position.width}" height="${position.height}"/></bpmndi:BPMNLabel>`
    : "";
}

function pointForEdge(node: FlowNode, side: "source" | "target", handle?: string): Point {
  const bounds = shapeBounds(node);
  const handleName = handle ?? "";
  const verticalRatio = handleName.endsWith("-top") ? 0.25 : handleName.endsWith("-bottom") ? 0.75 : 0.5;

  if (side === "source") {
    if (handleName === "out" || handleName.startsWith("out-bottom")) {
      const horizontalRatio = handleName.endsWith("-left") ? 0.25 : handleName.endsWith("-right") ? 0.75 : 0.5;
      return { x: bounds.x + bounds.width * horizontalRatio, y: bounds.y + bounds.height };
    }
    if (handleName.startsWith("out-left")) {
      return { x: bounds.x, y: bounds.y + bounds.height * verticalRatio };
    }
    return { x: bounds.x + bounds.width, y: bounds.y + bounds.height * verticalRatio };
  }

  if (handleName.startsWith("in-left")) {
    return { x: bounds.x, y: bounds.y + bounds.height * verticalRatio };
  }
  if (handleName === "in-right") {
    return { x: bounds.x + bounds.width, y: bounds.y + bounds.height / 2 };
  }
  if (handleName === "in-bottom") {
    return { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height };
  }
  return { x: bounds.x + bounds.width / 2, y: bounds.y };
}

function waypointsForEdge(edge: FlowEdge, source: FlowNode, target: FlowNode): Point[] {
  const start = pointForEdge(source, "source", edge.sourceHandle);
  const end = pointForEdge(target, "target", edge.targetHandle);

  if (edge.waypoints && edge.waypoints.length >= 2) {
    return edge.waypoints.map(({ x, y }) => ({ x, y }));
  }

  if (start.x === end.x || start.y === end.y) return [start, end];

  const horizontalRoute =
    !edge.sourceHandle ||
    edge.sourceHandle.startsWith("out-right") ||
    edge.sourceHandle.startsWith("out-left");

  if (horizontalRoute) {
    const middleX = start.x <= end.x ? start.x + (end.x - start.x) / 2 : start.x + 40;
    return [start, { x: middleX, y: start.y }, { x: middleX, y: end.y }, end];
  }

  if (edge.targetHandle === "in-right") {
    const approachX = end.x + 40;
    return [start, { x: approachX, y: start.y }, { x: approachX, y: end.y }, end];
  }

  const middleY = start.y + (end.y - start.y) / 2;
  return [start, { x: start.x, y: middleY }, { x: end.x, y: middleY }, end];
}

function waypointsForAnnotationAssociation(annotation: FlowAnnotation, target: FlowNode): Point[] {
  if (annotation.associationWaypoints && annotation.associationWaypoints.length >= 2) {
    return annotation.associationWaypoints.map(({ x, y }) => ({ x, y }));
  }

  const targetBounds = shapeBounds(target);
  const annotationCenter = { x: annotation.position.x + annotation.width / 2, y: annotation.position.y + 21 };
  const targetCenter = {
    x: targetBounds.x + targetBounds.width / 2,
    y: targetBounds.y + targetBounds.height / 2,
  };

  if (Math.abs(targetCenter.x - annotationCenter.x) >= Math.abs(targetCenter.y - annotationCenter.y)) {
    return targetCenter.x <= annotationCenter.x
      ? [
          { x: annotation.position.x, y: annotationCenter.y },
          { x: targetBounds.x + targetBounds.width, y: targetCenter.y },
        ]
      : [
          { x: annotation.position.x + annotation.width, y: annotationCenter.y },
          { x: targetBounds.x, y: targetCenter.y },
        ];
  }

  return targetCenter.y <= annotationCenter.y
    ? [
        { x: annotationCenter.x, y: annotation.position.y },
        { x: targetCenter.x, y: targetBounds.y + targetBounds.height },
      ]
    : [
        { x: annotationCenter.x, y: annotation.position.y + 42 },
        { x: targetCenter.x, y: targetBounds.y },
      ];
}

function containingLane(node: FlowNode, lanes: FlowLane[]): FlowLane | undefined {
  const centerX = node.position.x + nodeDimensions[node.type].width / 2;
  const centerY = node.position.y + nodeDimensions[node.type].height / 2;
  return lanes.find(
    (lane) =>
      centerX >= lane.position.x &&
      centerX <= lane.position.x + lane.width &&
      centerY >= lane.position.y &&
      centerY <= lane.position.y + lane.height,
  );
}

export function integrationFlowToBpmnXml(flow: IntegrationFlow): string {
  const nodeIds = new Map(flow.nodes.map((node) => [node.id, safeXmlId(node.id)]));
  const edgeIds = new Map(flow.edges.map((edge) => [edge.id, safeXmlId(edge.id)]));
  const laneIds = new Map((flow.lanes ?? []).map((lane) => [lane.id, safeXmlId(lane.id)]));
  const annotationIds = new Map(
    (flow.annotations ?? []).map((annotation) => [annotation.id, safeXmlId(annotation.id)]),
  );
  const processId = "Process_edi_flow";
  const planeId = "BPMNPlane_edi_flow";
  const lanes = flow.lanes ?? [];

  const laneXml = lanes
    .map((lane) => {
      const nodeRefs = flow.nodes
        .filter((node) => containingLane(node, lanes)?.id === lane.id)
        .map((node) => `<flowNodeRef>${nodeIds.get(node.id)}</flowNodeRef>`)
        .join("");
      return `<lane id="${laneIds.get(lane.id)}" name="${escapeXml(lane.label)}"${customAttributes({
        "edi:flowId": lane.id,
      })}>${nodeRefs}</lane>`;
    })
    .join("");

  const nodeXml = flow.nodes
    .map((node) => {
      const type = bpmnNodeType(node);
      return `<${type} id="${nodeIds.get(node.id)}" name="${escapeXml(node.label)}"${customAttributes({
        "edi:flowId": node.id,
        "edi:flowNodeType": node.type,
        "edi:operationKind": node.operationRef?.kind,
        "edi:operationName": node.operationRef?.name,
      })}/>`;
    })
    .join("");

  const edgeXml = flow.edges
    .filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target))
    .map(
      (edge) =>
        `<sequenceFlow id="${edgeIds.get(edge.id)}" sourceRef="${nodeIds.get(edge.source)}" targetRef="${nodeIds.get(edge.target)}"${customAttributes({
          name: edge.label,
          "edi:flowId": edge.id,
          "edi:sourceHandle": edge.sourceHandle,
          "edi:targetHandle": edge.targetHandle,
        })}/>`
    )
    .join("");

  const annotationXml = (flow.annotations ?? [])
    .map(
      (annotation) =>
        `<textAnnotation id="${annotationIds.get(annotation.id)}" text="${escapeXml(annotation.text)}"${customAttributes({
          "edi:flowId": annotation.id,
          "edi:targetNodeId": annotation.targetNodeId,
        })}/>`
    )
    .join("");

  const associationXml = (flow.annotations ?? [])
    .filter((annotation) => annotation.targetNodeId && nodeIds.has(annotation.targetNodeId))
    .map(
      (annotation) =>
        `<association id="${safeXmlId(`association-${annotation.id}`)}" sourceRef="${annotationIds.get(annotation.id)}" targetRef="${nodeIds.get(annotation.targetNodeId!)}"/>`,
    )
    .join("");

  const associationEdgeXml = (flow.annotations ?? [])
    .filter(
      (annotation) =>
        annotation.targetNodeId &&
        nodeIds.has(annotation.targetNodeId),
    )
    .map((annotation) => {
      const target = flow.nodes.find((node) => node.id === annotation.targetNodeId)!;
      const waypoints = waypointsForAnnotationAssociation(annotation, target)
        .map((point) => `<di:waypoint x="${point.x}" y="${point.y}"/>`)
        .join("");
      return `<bpmndi:BPMNEdge id="${safeXmlId(`association-${annotation.id}`)}_di" bpmnElement="${safeXmlId(`association-${annotation.id}`)}">${waypoints}</bpmndi:BPMNEdge>`;
    })
    .join("");

  const laneSetXml = lanes.length
    ? `<laneSet id="LaneSet_edi_flow">${laneXml}</laneSet>`
    : "";

  const shapeXml = [
    ...lanes.map(
      (lane) =>
        `<bpmndi:BPMNShape id="${laneIds.get(lane.id)}_di" bpmnElement="${laneIds.get(lane.id)}"><dc:Bounds x="${lane.position.x}" y="${lane.position.y}" width="${lane.width}" height="${lane.height}"/></bpmndi:BPMNShape>`,
    ),
    ...flow.nodes.map((node) => {
      const bounds = shapeBounds(node);
      return `<bpmndi:BPMNShape id="${nodeIds.get(node.id)}_di" bpmnElement="${nodeIds.get(node.id)}"><dc:Bounds x="${bounds.x}" y="${bounds.y}" width="${bounds.width}" height="${bounds.height}"/>${bpmnLabelXml(node.labelPosition)}</bpmndi:BPMNShape>`;
    }),
    ...(flow.annotations ?? []).map(
      (annotation) =>
        `<bpmndi:BPMNShape id="${annotationIds.get(annotation.id)}_di" bpmnElement="${annotationIds.get(annotation.id)}"><dc:Bounds x="${annotation.position.x}" y="${annotation.position.y}" width="${annotation.width}" height="42"/></bpmndi:BPMNShape>`,
    ),
  ].join("");

  const edgeShapeXml = flow.edges
    .filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target))
    .map((edge) => {
      const source = flow.nodes.find((node) => node.id === edge.source)!;
      const target = flow.nodes.find((node) => node.id === edge.target)!;
      const waypoints = waypointsForEdge(edge, source, target)
        .map((point) => `<di:waypoint x="${point.x}" y="${point.y}"/>`)
        .join("");
      return `<bpmndi:BPMNEdge id="${edgeIds.get(edge.id)}_di" bpmnElement="${edgeIds.get(edge.id)}">${waypoints}${bpmnLabelXml(edge.labelPosition)}</bpmndi:BPMNEdge>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="${BPMN_MODEL_NS}" xmlns:bpmndi="${BPMN_DI_NS}" xmlns:dc="${BPMN_DC_NS}" xmlns:di="${BPMN_DD_DI_NS}" xmlns:edi="https://funcionalcorp.com/edi/bpmn" id="Definitions_edi_flow" targetNamespace="https://funcionalcorp.com/edi">
  <process id="${processId}" name="${escapeXml(flow.title)}" isExecutable="false">
    ${laneSetXml}
    ${nodeXml}
    ${edgeXml}
    ${annotationXml}
    ${associationXml}
  </process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_edi_flow">
    <bpmndi:BPMNPlane id="${planeId}" bpmnElement="${processId}">
      ${shapeXml}
      ${edgeShapeXml}
      ${associationEdgeXml}
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</definitions>`;
}

function getAttribute(element: BpmnBusinessObject | undefined, key: string): string | undefined {
  const value = element?.$attrs?.[key];
  return typeof value === "string" ? value : undefined;
}

function originalId(element: BpmnElementLike): string {
  return getAttribute(element.businessObject, "edi:flowId") ?? element.id;
}

function isNodeElement(element: BpmnElementLike): boolean {
  const type = element.businessObject?.$type ?? "";
  return (
    type === "bpmn:StartEvent" ||
    type === "bpmn:EndEvent" ||
    type === "bpmn:ExclusiveGateway" ||
    type.endsWith("Task") ||
    type === "bpmn:SubProcess" ||
    type.endsWith("Event")
  );
}

function flowNodeType(element: BpmnElementLike): FlowNodeType {
  const customType = getAttribute(element.businessObject, "edi:flowNodeType");
  if (customType && ["start", "operation", "decision", "box", "text", "end"].includes(customType)) {
    return customType as FlowNodeType;
  }
  const type = element.businessObject?.$type ?? "";
  if (type === "bpmn:StartEvent") return "start";
  if (type === "bpmn:EndEvent") return "end";
  if (type.includes("Gateway")) return "decision";
  return "operation";
}

function elementLabel(element: BpmnElementLike, fallback: string): string {
  return String(element.businessObject?.name ?? fallback).trim().slice(0, 200) || fallback;
}

function elementRegistry(modeler: BpmnModelerLike): BpmnElementLike[] {
  const registry = modeler.get("elementRegistry") as { getAll(): BpmnElementLike[] };
  return registry.getAll();
}

export function bpmnModelerToIntegrationFlow(
  modeler: BpmnModelerLike,
  meta: FlowMeta,
): IntegrationFlow {
  const allElements = elementRegistry(modeler);
  const labelPositions = new Map<string, LabelPosition>();
  for (const element of allElements) {
    if (element.type !== "label" || !element.labelTarget?.id) continue;
    const position = labelPosition(element);
    if (position) labelPositions.set(element.labelTarget.id, position);
  }

  const elements = allElements.filter((element) => element.type !== "label");
  const nodeElements = elements.filter(isNodeElement);
  const nodeIdsByBpmnId = new Map(nodeElements.map((element) => [element.id, originalId(element)]));
  const nodeIds = new Set(nodeIdsByBpmnId.values());
  const annotationIds = new Set(
    elements
      .filter((element) => element.businessObject?.$type === "bpmn:TextAnnotation")
      .map((element) => element.id),
  );
  const associationsByAnnotationId = new Map<
    string,
    { targetNodeId: string; waypoints?: Array<{ x: number; y: number }> }
  >();
  for (const element of elements) {
    if (element.businessObject?.$type !== "bpmn:Association") continue;
    const sourceId = element.businessObject.sourceRef?.id;
    const targetId = element.businessObject.targetRef?.id;
    const annotationId = annotationIds.has(sourceId ?? "")
      ? sourceId
      : annotationIds.has(targetId ?? "")
        ? targetId
        : undefined;
    const linkedNodeId = nodeIdsByBpmnId.get(annotationId === sourceId ? targetId ?? "" : sourceId ?? "");
    if (!annotationId || !linkedNodeId) continue;
    associationsByAnnotationId.set(annotationId, {
      targetNodeId: linkedNodeId,
      waypoints:
        element.waypoints && element.waypoints.length >= 2
          ? element.waypoints.map(({ x, y }) => ({ x, y }))
          : undefined,
    });
  }
  const nodes: FlowNode[] = nodeElements.map((element) => {
    const type = flowNodeType(element);
    const operationKind = getAttribute(element.businessObject, "edi:operationKind");
    const operationName = getAttribute(element.businessObject, "edi:operationName");
    return {
      id: originalId(element),
      type,
      label: elementLabel(element, type === "start" ? "Início" : type === "end" ? "Fim" : "Atividade"),
      position: { x: element.x ?? 0, y: element.y ?? 0 },
      labelPosition: labelPositions.get(element.id),
      operationRef:
        operationKind === "query" || operationKind === "mutation"
          ? { kind: operationKind, name: operationName ?? "" }
          : undefined,
    };
  });

  const edges: FlowEdge[] = elements
    .filter((element) => element.businessObject?.$type === "bpmn:SequenceFlow")
    .map((element) => {
      const source = element.businessObject?.sourceRef?.id;
      const target = element.businessObject?.targetRef?.id;
      return {
        id: originalId(element),
        source: nodeIdsByBpmnId.get(source ?? "") ?? source ?? "",
        target: nodeIdsByBpmnId.get(target ?? "") ?? target ?? "",
        sourceHandle: getAttribute(element.businessObject, "edi:sourceHandle"),
        targetHandle: getAttribute(element.businessObject, "edi:targetHandle"),
        waypoints:
          element.waypoints && element.waypoints.length >= 2
            ? element.waypoints.map(({ x, y }) => ({ x, y }))
            : undefined,
        labelPosition: labelPositions.get(element.id),
        label: element.businessObject?.name?.trim().slice(0, 64) || undefined,
      };
    })
    .filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target));

  const lanes: FlowLane[] = elements
    .filter((element) => element.businessObject?.$type === "bpmn:Lane")
    .map((element) => ({
      id: originalId(element),
      label: elementLabel(element, "Raia"),
      position: { x: element.x ?? 0, y: element.y ?? 0 },
      width: element.width ?? 1,
      height: element.height ?? 1,
    }));

  const annotations: FlowAnnotation[] = elements
    .filter((element) => element.businessObject?.$type === "bpmn:TextAnnotation")
    .map((element) => {
      const association = associationsByAnnotationId.get(element.id);
      return {
        id: originalId(element),
        text: String(element.businessObject?.text ?? "").trim().slice(0, 300) || "Observação",
        position: { x: element.x ?? 0, y: element.y ?? 0 },
        width: element.width ?? 240,
        targetNodeId: association?.targetNodeId ?? getAttribute(element.businessObject, "edi:targetNodeId"),
        associationWaypoints: association?.waypoints,
      };
    });

  return {
    ...meta,
    nodes,
    edges,
    lanes: lanes.length ? lanes : undefined,
    annotations: annotations.length ? annotations : undefined,
  };
}

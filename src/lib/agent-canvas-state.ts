import { isRecord } from "@/lib/utils";
import type { CanvasEdge, CanvasNode } from "@/types/canvas";
import type { SessionCanvasState } from "@/types/session";

/**
 * Normalizes agent-provided value into SessionCanvasState, or null if unusable.
 */
const parseSessionCanvasFromUnknown = (
  value: unknown
): SessionCanvasState | null => {
  if (!isRecord(value)) return null;
  if (!value) return null;

  const { nodes, edges, selectedNodeId } = value;
  if (!Array.isArray(nodes) || !Array.isArray(edges)) return null;
  if (
    selectedNodeId !== null &&
    selectedNodeId !== undefined &&
    typeof selectedNodeId !== "string"
  ) {
    return null;
  }
  return {
    nodes: nodes as CanvasNode[],
    edges: edges as CanvasEdge[],
    selectedNodeId:
      selectedNodeId === undefined || selectedNodeId === null
        ? null
        : selectedNodeId,
  };
};

/**
 * Reads `canvas` from AG-UI agent.state (InsightAgentState shape).
 */
export const extractCanvasFromAgentState = (
  state: unknown
): SessionCanvasState | null => {
  try {
    const parsedState: Record<string, unknown> =
      typeof state === "string" ? JSON.parse(state) : state;
    return parseSessionCanvasFromUnknown(parsedState.canvas);
  } catch (error) {
    console.error("Error parsing agent state", error);
    return null;
  }
};

/**
 * Applies agent-proposed canvas onto the current store snapshot:
 * - Drops new chart nodes (ids not present as charts in `prev`).
 * - For existing chart nodes, keeps chartSpec / sourceQuery / fieldsUsed from `prev`.
 * - Drops edges that reference missing node ids after filtering.
 */
export const mergeAgentCanvasIntoStore = (
  prev: SessionCanvasState,
  incoming: SessionCanvasState
): SessionCanvasState => {
  const prevChartIds = new Set(
    prev.nodes.filter((n) => n.data.variant === "chart").map((n) => n.id)
  );

  const filteredIncomingNodes: CanvasNode[] = [];

  for (const node of incoming.nodes) {
    if (node.data.variant === "chart") {
      if (!prevChartIds.has(node.id)) {
        continue;
      }
    }
    filteredIncomingNodes.push(node);
  }

  const allowedIds = new Set(filteredIncomingNodes.map((n) => n.id));
  const filteredEdges = incoming.edges.filter(
    (e) => allowedIds.has(e.source) && allowedIds.has(e.target)
  );

  let selectedNodeId = incoming.selectedNodeId;
  if (selectedNodeId && !allowedIds.has(selectedNodeId)) {
    selectedNodeId = null;
  }

  return {
    nodes: filteredIncomingNodes,
    edges: filteredEdges,
    selectedNodeId,
  };
};

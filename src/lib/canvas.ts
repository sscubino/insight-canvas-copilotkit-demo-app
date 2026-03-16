import type { CanvasNode, CanvasEdge, CanvasNodeData } from "@/types/canvas";

const NODE_OFFSET_X = 300;
const NODE_OFFSET_Y = 100;
const DEFAULT_START_X = 80;
const DEFAULT_START_Y = 80;

export const computePosition = (
  nodes: CanvasNode[],
  sourceNodeId?: string
): { x: number; y: number } => {
  if (sourceNodeId) {
    const sourceNode = nodes.find((n) => n.id === sourceNodeId);
    if (sourceNode) {
      return {
        x: sourceNode.position.x + NODE_OFFSET_X,
        y: sourceNode.position.y + NODE_OFFSET_Y,
      };
    }
  }

  if (nodes.length === 0) {
    return { x: DEFAULT_START_X, y: DEFAULT_START_Y };
  }

  const maxX = Math.max(...nodes.map((n) => n.position.x));
  const maxY = Math.max(...nodes.map((n) => n.position.y));
  return { x: maxX + NODE_OFFSET_X, y: maxY + NODE_OFFSET_Y };
};

export const generateNodeId = (variant: string): string =>
  `${variant}-${crypto.randomUUID().slice(0, 8)}`;

export const generateEdgeId = (sourceId: string, targetId: string): string =>
  `edge-${sourceId}-${targetId}`;

export const createCanvasNode = (
  data: CanvasNodeData,
  position: { x: number; y: number }
): CanvasNode => ({
  id: generateNodeId(data.variant),
  type: data.variant,
  position,
  data,
});

export const addNodeToCanvas = (
  data: CanvasNodeData,
  nodes: CanvasNode[],
  edges: CanvasEdge[],
  sourceNodeId?: string
): { nodes: CanvasNode[]; edges: CanvasEdge[]; nodeId: string } => {
  const position = computePosition(nodes, sourceNodeId);
  const newNode = createCanvasNode(data, position);

  const newNodes = [...nodes, newNode];
  const newEdges = sourceNodeId
    ? [
        ...edges,
        {
          id: generateEdgeId(sourceNodeId, newNode.id),
          source: sourceNodeId,
          target: newNode.id,
        },
      ]
    : edges;

  return { nodes: newNodes, edges: newEdges, nodeId: newNode.id };
};

export const updateNodeInCanvas = (
  nodes: CanvasNode[],
  id: string,
  data: Partial<CanvasNodeData>
): CanvasNode[] =>
  nodes.map((node) =>
    node.id === id
      ? { ...node, data: { ...node.data, ...data } as CanvasNodeData }
      : node
  );

export const removeNodeFromCanvas = (
  nodes: CanvasNode[],
  edges: CanvasEdge[],
  id: string
): { nodes: CanvasNode[]; edges: CanvasEdge[] } => ({
  nodes: nodes.filter((node) => node.id !== id),
  edges: edges.filter((edge) => edge.source !== id && edge.target !== id),
});

export const addEdgeToCanvas = (
  edges: CanvasEdge[],
  sourceId: string,
  targetId: string
): CanvasEdge[] => {
  const exists = edges.some(
    (e) => e.source === sourceId && e.target === targetId
  );
  if (exists) return edges;
  return [
    ...edges,
    {
      id: generateEdgeId(sourceId, targetId),
      source: sourceId,
      target: targetId,
    },
  ];
};

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import {
  applyNodeChanges,
  applyEdgeChanges,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
} from "@xyflow/react";
import type { CanvasNode, CanvasEdge, CanvasNodeData } from "@/types/canvas";
import {
  addNodeToCanvas,
  updateNodeInCanvas,
  removeNodeFromCanvas,
  addEdgeToCanvas,
} from "@/lib/canvas";

type CanvasStateContextValue = {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  onNodesChange: OnNodesChange<CanvasNode>;
  onEdgesChange: OnEdgesChange<CanvasEdge>;
  onConnect: OnConnect;
  addNode: (data: CanvasNodeData, sourceNodeId?: string) => string;
  updateNode: (id: string, data: Partial<CanvasNodeData>) => void;
  removeNode: (id: string) => void;
  addEdge: (sourceId: string, targetId: string) => void;
};

const CanvasStateContext = createContext<CanvasStateContextValue | null>(null);

const CanvasStateProvider = ({ children }: { children: ReactNode }) => {
  const [nodes, setNodes] = useState<CanvasNode[]>([]);
  const [edges, setEdges] = useState<CanvasEdge[]>([]);

  const onNodesChange: OnNodesChange<CanvasNode> = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange: OnEdgesChange<CanvasEdge> = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect: OnConnect = useCallback((connection) => {
    setEdges((eds) =>
      addEdgeToCanvas(eds, connection.source, connection.target)
    );
  }, []);

  const addNode = useCallback(
    (data: CanvasNodeData, sourceNodeId?: string): string => {
      const result = addNodeToCanvas(data, nodes, edges, sourceNodeId);
      setNodes(result.nodes);
      setEdges(result.edges);
      return result.nodeId;
    },
    [nodes, edges]
  );

  const updateNode = useCallback(
    (id: string, data: Partial<CanvasNodeData>) => {
      setNodes((nds) => updateNodeInCanvas(nds, id, data));
    },
    []
  );

  const removeNode = useCallback(
    (id: string) => {
      const result = removeNodeFromCanvas(nodes, edges, id);
      setNodes(result.nodes);
      setEdges(result.edges);
    },
    [nodes, edges]
  );

  const addEdge = useCallback((sourceId: string, targetId: string) => {
    setEdges((eds) => addEdgeToCanvas(eds, sourceId, targetId));
  }, []);

  return (
    <CanvasStateContext.Provider
      value={{
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        addNode,
        updateNode,
        removeNode,
        addEdge,
      }}
    >
      {children}
    </CanvasStateContext.Provider>
  );
};

const useCanvasState = (): CanvasStateContextValue => {
  const context = useContext(CanvasStateContext);
  if (!context) {
    throw new Error(
      "useCanvasState must be used within a <CanvasStateProvider>"
    );
  }
  return context;
};

export { CanvasStateProvider, useCanvasState };

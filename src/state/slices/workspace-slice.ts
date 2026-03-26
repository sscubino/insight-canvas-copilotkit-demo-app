import {
  applyEdgeChanges,
  applyNodeChanges,
  type OnConnect,
  type OnEdgesChange,
  type OnNodesChange,
} from "@xyflow/react";
import {
  addEdgeToCanvas,
  addNodeToCanvas,
  removeNodeFromCanvas,
  updateNodeInCanvas,
} from "@/lib/canvas";
import type { CanvasEdge, CanvasNode, CanvasNodeData } from "@/types/canvas";
import type { StateCreator } from "zustand";
import type { AppStore } from "@/state/store";

export type WorkspaceSlice = {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  selectedNodeId: string | null;
  onNodesChange: OnNodesChange<CanvasNode>;
  onEdgesChange: OnEdgesChange<CanvasEdge>;
  onConnect: OnConnect;
  addNode: (data: CanvasNodeData, sourceNodeId?: string) => string;
  updateNode: (id: string, data: Partial<CanvasNodeData>) => void;
  removeNode: (id: string) => void;
  addEdge: (sourceId: string, targetId: string) => void;
  selectNode: (id: string) => void;
  deselectNode: () => void;
  replaceCanvasState: (state: {
    nodes: CanvasNode[];
    edges: CanvasEdge[];
    selectedNodeId: string | null;
  }) => void;
};

export const createWorkspaceSlice: StateCreator<
  AppStore,
  [],
  [],
  WorkspaceSlice
> = (set) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  onNodesChange: (changes) => {
    set((state) => ({ nodes: applyNodeChanges(changes, state.nodes) }));
  },
  onEdgesChange: (changes) => {
    set((state) => ({ edges: applyEdgeChanges(changes, state.edges) }));
  },
  onConnect: (connection) => {
    set((state) => ({
      edges: addEdgeToCanvas(state.edges, connection.source, connection.target),
    }));
  },
  addNode: (data, sourceNodeId) => {
    let nodeId = "";
    set((state) => {
      const result = addNodeToCanvas(data, state.nodes, state.edges, sourceNodeId);
      nodeId = result.nodeId;
      return {
        nodes: result.nodes,
        edges: result.edges,
      };
    });
    return nodeId;
  },
  updateNode: (id, data) => {
    set((state) => ({ nodes: updateNodeInCanvas(state.nodes, id, data) }));
  },
  removeNode: (id) => {
    set((state) => {
      const result = removeNodeFromCanvas(state.nodes, state.edges, id);
      return {
        nodes: result.nodes,
        edges: result.edges,
      };
    });
  },
  addEdge: (sourceId, targetId) => {
    set((state) => ({
      edges: addEdgeToCanvas(state.edges, sourceId, targetId),
    }));
  },
  selectNode: (id) => {
    set((state) => ({
      selectedNodeId: state.selectedNodeId === id ? null : id,
    }));
  },
  deselectNode: () => {
    set(() => ({ selectedNodeId: null }));
  },
  replaceCanvasState: (nextState) => {
    set(() => ({
      nodes: nextState.nodes,
      edges: nextState.edges,
      selectedNodeId: nextState.selectedNodeId,
    }));
  },
});

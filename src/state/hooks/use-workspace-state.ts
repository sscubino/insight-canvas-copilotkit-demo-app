"use client";

import { useAppStore } from "@/state/store";

export const useWorkspaceState = () => {
  const nodes = useAppStore((state) => state.nodes);
  const edges = useAppStore((state) => state.edges);
  const selectedNodeId = useAppStore((state) => state.selectedNodeId);
  const onNodesChange = useAppStore((state) => state.onNodesChange);
  const onEdgesChange = useAppStore((state) => state.onEdgesChange);
  const onConnect = useAppStore((state) => state.onConnect);
  const addNode = useAppStore((state) => state.addNode);
  const updateNode = useAppStore((state) => state.updateNode);
  const removeNode = useAppStore((state) => state.removeNode);
  const addEdge = useAppStore((state) => state.addEdge);
  const selectNode = useAppStore((state) => state.selectNode);
  const deselectNode = useAppStore((state) => state.deselectNode);
  const replaceCanvasState = useAppStore((state) => state.replaceCanvasState);

  return {
    nodes,
    edges,
    selectedNodeId,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    updateNode,
    removeNode,
    addEdge,
    selectNode,
    deselectNode,
    replaceCanvasState,
  };
};

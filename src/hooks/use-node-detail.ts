"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAgent } from "@copilotkit/react-core/v2";
import { useAppStore } from "@/state/store";
import type { CanvasNodeData } from "@/types/canvas";
import {
  buildCanvasEditPayload,
  getNodeContentText,
} from "@/components/chat/user-message";
import { USER_EDIT_PREFIX } from "@/constants/chat";
import { getConnectedNodesForNodeId } from "@/lib/canvas";

const useNodeDetail = () => {
  const selectedNodeId = useAppStore((s) => s.selectedNodeId);
  const nodes = useAppStore((s) => s.nodes);
  const edges = useAppStore((s) => s.edges);
  const deselectNode = useAppStore((s) => s.deselectNode);
  const selectNode = useAppStore((s) => s.selectNode);
  const removeNode = useAppStore((s) => s.removeNode);
  const updateNode = useAppStore((s) => s.updateNode);
  const { agent } = useAgent();
  const [hasPendingEdits, setHasPendingEdits] = useState(false);
  const snapshotTextRef = useRef<string | null>(null);

  const selectedNode = useMemo(() => {
    return selectedNodeId
      ? (nodes.find((n) => n.id === selectedNodeId) ?? null)
      : null;
  }, [selectedNodeId, nodes]);

  const { incomingNodes, outgoingNodes } = useMemo(() => {
    return getConnectedNodesForNodeId(selectedNodeId, nodes, edges);
  }, [selectedNodeId, nodes, edges]);

  useEffect(() => {
    setHasPendingEdits(false);
    if (!selectedNode) {
      snapshotTextRef.current = null;
      return;
    }
    snapshotTextRef.current = getNodeContentText(selectedNode.data);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- snapshot only on selection change, not on every data edit
  }, [selectedNode?.id]);

  const handleRemoveNode = () => {
    if (!selectedNode) return;
    removeNode(selectedNode.id);
    deselectNode();
  };

  const handleNodeDataChange = (data: Partial<CanvasNodeData>) => {
    if (!selectedNode) return;
    updateNode(selectedNode.id, data);
    setHasPendingEdits(true);
  };

  const handleRunEdits = () => {
    if (!selectedNode || !hasPendingEdits) return;

    const previousText = snapshotTextRef.current ?? "";
    const newText = getNodeContentText(selectedNode.data) ?? "";

    void agent.addMessage({
      role: "user",
      id: `${USER_EDIT_PREFIX}${crypto.randomUUID()}`,
      content: buildCanvasEditPayload({
        title: selectedNode.data.title,
        variant: selectedNode.data.variant,
        previousText,
        newText,
      }),
    });
    void agent.runAgent();
    setHasPendingEdits(false);
    deselectNode();
  };

  return {
    selectedNode,
    hasPendingEdits,
    incomingNodes,
    outgoingNodes,
    handleNodeDataChange,
    handleRemoveNode,
    handleRunEdits,
    selectNode,
    deselectNode,
  };
};

export { useNodeDetail };

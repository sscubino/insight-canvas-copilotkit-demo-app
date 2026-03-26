"use client";

import { useEffect, useRef, useState } from "react";
import { useCopilotChatInternal } from "@copilotkit/react-core";
import { useCoAgent } from "@copilotkit/react-core";
import { Drawer, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useWorkspaceState } from "@/state/hooks/use-workspace-state";
import { INSIGHT_CANVAS_AGENT_ID } from "@/mastra/constants";
import { toAgentNodes, toAgentEdges } from "@/hooks/use-canvas-agent";
import { NodeDetailContent } from "@/components/chat/node-detail/node-detail-content";
import { NodeDetailFooter } from "@/components/chat/node-detail/node-detail-footer";
import type { AgentCanvasState } from "@/mastra/agents/state";
import type { CanvasNodeData } from "@/types/canvas";

const NodeDetailDrawer = () => {
  const {
    selectedNodeId,
    deselectNode,
    selectNode,
    removeNode,
    updateNode,
    nodes,
    edges,
  } = useWorkspaceState();
  const { sendMessage } = useCopilotChatInternal();
  const { setState: setAgentStateRaw } = useCoAgent<AgentCanvasState>({
    name: INSIGHT_CANVAS_AGENT_ID,
  });
  const setAgentStateRef = useRef(setAgentStateRaw);
  setAgentStateRef.current = setAgentStateRaw;
  const [hasPendingEdits, setHasPendingEdits] = useState(false);
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  useEffect(() => {
    setHasPendingEdits(false);
  }, [selectedNode?.id]);

  const syncToAgent = (
    updatedNodes: typeof nodes,
    updatedEdges: typeof edges
  ) => {
    setAgentStateRef.current({
      nodes: toAgentNodes(updatedNodes),
      edges: toAgentEdges(updatedEdges),
      selectedNodeId,
    });
  };

  const handleRemoveNode = () => {
    if (!selectedNode) return;
    removeNode(selectedNode.id);

    const filteredNodes = nodes.filter((n) => n.id !== selectedNode.id);
    const filteredEdges = edges.filter(
      (e) => e.source !== selectedNode.id && e.target !== selectedNode.id
    );
    syncToAgent(filteredNodes, filteredEdges);
    deselectNode();
  };

  const handleNodeDataChange = (data: Partial<CanvasNodeData>) => {
    if (!selectedNode) return;
    updateNode(selectedNode.id, data);

    const updatedNodes = nodes.map((n) =>
      n.id === selectedNode.id
        ? { ...n, data: { ...n.data, ...data } as CanvasNodeData }
        : n
    );
    syncToAgent(updatedNodes, edges);
    setHasPendingEdits(true);
  };

  const handleRunEdits = () => {
    if (!selectedNode || !hasPendingEdits) return;

    void sendMessage(
      {
        id: `user-edit-${crypto.randomUUID()}`,
        role: "user",
        content: `I edited the node "${selectedNode.data.title}".`,
      },
      { followUp: true }
    );
    setHasPendingEdits(false);
    deselectNode();
  };

  return (
    <Drawer
      isOpen={!!selectedNode}
      onClose={deselectNode}
      className="max-h-[calc(100%-80px)]"
    >
      {selectedNode && (
        <>
          <DrawerHeader>
            <DrawerTitle>{selectedNode?.data.title}</DrawerTitle>
          </DrawerHeader>
          <NodeDetailContent
            node={selectedNode}
            nodes={nodes}
            edges={edges}
            onNodeClick={selectNode}
            onNodeDataChange={handleNodeDataChange}
          />
          <NodeDetailFooter
            node={selectedNode}
            hasPendingEdits={hasPendingEdits}
            handleRemoveNode={handleRemoveNode}
            handleRunEdits={handleRunEdits}
          />
        </>
      )}
    </Drawer>
  );
};

export { NodeDetailDrawer };

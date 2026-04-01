"use client";

import { useEffect, useState } from "react";
import { useCopilotChatInternal } from "@copilotkit/react-core";
import { Drawer, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useWorkspaceState } from "@/state/hooks/use-workspace-state";
import { NodeDetailContent } from "@/components/chat/node-detail/node-detail-content";
import { NodeDetailFooter } from "@/components/chat/node-detail/node-detail-footer";
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
  const [hasPendingEdits, setHasPendingEdits] = useState(false);
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  useEffect(() => {
    setHasPendingEdits(false);
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

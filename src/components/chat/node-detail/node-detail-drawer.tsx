"use client";

import { Drawer, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { NodeDetailContent } from "@/components/chat/node-detail/node-detail-content";
import { NodeDetailFooter } from "@/components/chat/node-detail/node-detail-footer";
import { useNodeDetail } from "@/hooks/use-node-detail";

const NodeDetailDrawer = () => {
  const {
    selectedNode,
    hasPendingEdits,
    incomingNodes,
    outgoingNodes,
    handleNodeDataChange,
    handleRemoveNode,
    handleRunEdits,
    selectNode,
    deselectNode,
  } = useNodeDetail();

  return (
    <Drawer
      isOpen={!!selectedNode}
      onClose={deselectNode}
      className="max-h-[calc(100%-80px)]"
    >
      {selectedNode && (
        <>
          <DrawerHeader>
            <DrawerTitle>{selectedNode.data.title}</DrawerTitle>
          </DrawerHeader>
          <NodeDetailContent
            node={selectedNode}
            incomingNodes={incomingNodes}
            outgoingNodes={outgoingNodes}
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

"use client";

import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useCanvasState } from "@/contexts/canvas-state-context";
import { NodeDetailContent } from "@/components/chat/node-detail/node-detail-content";

const NodeDetailDrawer = () => {
  const { selectedNodeId, deselectNode, selectNode, nodes, edges } =
    useCanvasState();
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  return (
    <Drawer
      isOpen={!!selectedNode}
      onClose={deselectNode}
      className="max-h-[calc(100%-80px)]"
    >
      <DrawerContent>
        {selectedNode && (
          <NodeDetailContent
            node={selectedNode}
            nodes={nodes}
            edges={edges}
            onNodeClick={selectNode}
          />
        )}
      </DrawerContent>
    </Drawer>
  );
};

export { NodeDetailDrawer };

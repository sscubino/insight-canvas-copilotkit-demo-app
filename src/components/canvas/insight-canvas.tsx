"use client";

import { useRef } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  type DefaultEdgeOptions,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { NODE_TYPES } from "@/constants/nodes-config";
import { CanvasZoomControls } from "./canvas-zoom-controls";
import { useAppStore } from "@/state/store";
import { useAutoFitNewNodes } from "@/hooks/use-auto-fit-new-nodes";

const defaultEdgeOptions: DefaultEdgeOptions = {
  style: {
    stroke: "var(--dim)",
    strokeWidth: 1.5,
    strokeDasharray: "4 3",
  },
};

const InsightCanvasInner = () => {
  const nodes = useAppStore((s) => s.nodes);
  const edges = useAppStore((s) => s.edges);
  const onNodesChange = useAppStore((s) => s.onNodesChange);
  const onEdgesChange = useAppStore((s) => s.onEdgesChange);
  const onConnect = useAppStore((s) => s.onConnect);
  const selectNode = useAppStore((s) => s.selectNode);
  const deselectNode = useAppStore((s) => s.deselectNode);
  const containerRef = useRef<HTMLDivElement>(null);

  useAutoFitNewNodes({ nodes, containerRef });

  return (
    <div ref={containerRef} className="relative h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => selectNode(node.id)}
        onPaneClick={() => deselectNode()}
        nodeTypes={NODE_TYPES}
        defaultEdgeOptions={defaultEdgeOptions}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        proOptions={{ hideAttribution: true }}
        minZoom={0.3}
        maxZoom={2}
      >
        <Background
          gap={15}
          size={2}
          variant={BackgroundVariant.Dots}
          style={{ opacity: 0.2 }}
        />
      </ReactFlow>
      <CanvasZoomControls />
    </div>
  );
};

const InsightCanvas = () => {
  return (
    <ReactFlowProvider>
      <InsightCanvasInner />
    </ReactFlowProvider>
  );
};

export { InsightCanvas };

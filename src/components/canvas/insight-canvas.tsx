"use client";

import { useRef } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  type DefaultEdgeOptions,
  MarkerType,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { nodeTypes } from "./nodes";
import { CanvasZoomControls } from "./canvas-zoom-controls";
import { useCanvasState } from "@/contexts/canvas-state-context";
import { useAutoFitNewNodes } from "@/hooks/use-auto-fit-new-nodes";

const defaultEdgeOptions: DefaultEdgeOptions = {
  style: {
    stroke: "var(--dim)",
    strokeWidth: 1.5,
    strokeDasharray: "4 3",
  },
};

const InsightCanvasInner = () => {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } =
    useCanvasState();
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
        nodeTypes={nodeTypes}
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

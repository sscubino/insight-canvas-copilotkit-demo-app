"use client";

import { useRef } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  type DefaultEdgeOptions,
  MarkerType,
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
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 12,
    height: 12,
    color: "var(--dim)",
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
          gap={32}
          size={1}
          color="var(--dim)"
          style={{ opacity: 0.3 }}
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

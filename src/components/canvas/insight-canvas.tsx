"use client";

import { useCallback } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  type OnConnect,
  type DefaultEdgeOptions,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { nodeTypes } from "./nodes";
import { CanvasToolbar } from "./canvas-toolbar";
import { CanvasZoomControls } from "./canvas-zoom-controls";
import { SEED_NODES, SEED_EDGES } from "@/constants/seed-data";

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
  const [nodes, , onNodesChange] = useNodesState(SEED_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(SEED_EDGES);

  const handleConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="relative h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        fitViewOptions={{ padding: 0.3 }}
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

      <CanvasToolbar />
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

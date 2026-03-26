"use client";

import { useCallback, useRef } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  type DefaultEdgeOptions,
  type Connection,
  BackgroundVariant,
} from "@xyflow/react";
import { useCoAgent } from "@copilotkit/react-core";
import "@xyflow/react/dist/style.css";

import { NODE_TYPES } from "@/constants/nodes-config";
import { CanvasZoomControls } from "./canvas-zoom-controls";
import { useWorkspaceState } from "@/state/hooks/use-workspace-state";
import { useAutoFitNewNodes } from "@/hooks/use-auto-fit-new-nodes";
import { INSIGHT_CANVAS_AGENT_ID } from "@/mastra/constants";
import { generateEdgeId } from "@/lib/canvas";
import type { AgentCanvasState } from "@/mastra/agents/state";

const defaultEdgeOptions: DefaultEdgeOptions = {
  style: {
    stroke: "var(--dim)",
    strokeWidth: 1.5,
    strokeDasharray: "4 3",
  },
};

const InsightCanvasInner = () => {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    selectNode,
    deselectNode,
  } = useWorkspaceState();
  const { state: agentState, setState: setAgentStateRaw } =
    useCoAgent<AgentCanvasState>({
      name: INSIGHT_CANVAS_AGENT_ID,
    });
  const agentStateRef = useRef(agentState);
  agentStateRef.current = agentState;
  const setAgentStateRef = useRef(setAgentStateRaw);
  setAgentStateRef.current = setAgentStateRaw;
  const containerRef = useRef<HTMLDivElement>(null);

  useAutoFitNewNodes({ nodes, containerRef });

  const handleConnect = useCallback(
    (connection: Connection) => {
      onConnect(connection);

      const currentEdges = agentStateRef.current?.edges ?? [];
      const newEdge = {
        id: generateEdgeId(connection.source, connection.target),
        source: connection.source,
        target: connection.target,
      };
      setAgentStateRef.current({
        ...(agentStateRef.current ?? {
          nodes: [],
          edges: [],
          selectedNodeId: null,
        }),
        edges: [...currentEdges, newEdge],
      });
    },
    [onConnect]
  );

  return (
    <div ref={containerRef} className="relative h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
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

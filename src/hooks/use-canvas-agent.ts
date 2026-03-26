"use client";

import { useEffect, useRef, useCallback } from "react";
import { useCoAgent } from "@copilotkit/react-core";
import { useWorkspaceState } from "@/state/hooks/use-workspace-state";
import { useAppStore } from "@/state/store";
import { INSIGHT_CANVAS_AGENT_ID } from "@/mastra/constants";
import { computePosition, generateNodeId, generateEdgeId } from "@/lib/canvas";
import type { AgentCanvasState } from "@/mastra/agents/state";
import type { CanvasNode, CanvasEdge, CanvasNodeData } from "@/types/canvas";

const EMPTY_STATE: AgentCanvasState = {
  nodes: [],
  edges: [],
  selectedNodeId: null,
};

const toReactFlowNodes = (
  agentNodes: AgentCanvasState["nodes"]
): CanvasNode[] =>
  agentNodes.map((n) => ({
    id: n.id,
    type: n.variant,
    position: n.position ?? { x: 80, y: 80 },
    data: {
      variant: n.variant,
      title: n.title,
      createdAt: n.createdAt,
      source: n.source,
      ...(n.content !== undefined && { content: n.content }),
      ...(n.plan !== undefined && { plan: n.plan }),
      ...(n.expectedOutcome !== undefined && {
        expectedOutcome: n.expectedOutcome,
      }),
      ...(n.description !== undefined && { description: n.description }),
      ...(n.chartSpec !== undefined && { chartSpec: n.chartSpec }),
      ...(n.sourceQuery !== undefined && { sourceQuery: n.sourceQuery }),
    } as CanvasNodeData,
  }));

const toReactFlowEdges = (
  agentEdges: AgentCanvasState["edges"]
): CanvasEdge[] =>
  agentEdges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
  }));

const toAgentNodes = (rfNodes: CanvasNode[]): AgentCanvasState["nodes"] =>
  rfNodes.map((n) => {
    const d = n.data;
    return {
      id: n.id,
      variant: d.variant,
      title: d.title,
      createdAt: d.createdAt,
      source: d.source,
      position: n.position,
      ...("content" in d && d.content !== undefined && { content: d.content }),
      ...("plan" in d && d.plan !== undefined && { plan: d.plan }),
      ...("expectedOutcome" in d &&
        d.expectedOutcome !== undefined && {
          expectedOutcome: d.expectedOutcome,
        }),
      ...("description" in d &&
        d.description !== undefined && { description: d.description }),
      ...("chartSpec" in d &&
        d.chartSpec !== undefined && { chartSpec: d.chartSpec }),
      ...("sourceQuery" in d &&
        d.sourceQuery !== undefined && { sourceQuery: d.sourceQuery }),
    };
  });

const toAgentEdges = (rfEdges: CanvasEdge[]): AgentCanvasState["edges"] =>
  rfEdges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
  }));

type AgentStateSetter = (
  newState:
    | AgentCanvasState
    | ((prev: AgentCanvasState | undefined) => AgentCanvasState)
) => void;

type UseCanvasAgentReturn = {
  agentState: AgentCanvasState;
  setAgentState: AgentStateSetter;
  addNodeViaAgent: (data: CanvasNodeData, sourceNodeId?: string) => string;
  running: boolean;
};

export const useCanvasAgent = (
  initialState?: AgentCanvasState
): UseCanvasAgentReturn => {
  const { state, setState: setStateRaw } = useCoAgent<AgentCanvasState>({
    name: INSIGHT_CANVAS_AGENT_ID,
    initialState: initialState ?? EMPTY_STATE,
  });

  const { replaceCanvasState } = useWorkspaceState();
  const hydrationRecord = useAppStore((s) => s.hydrationRecord);
  const syncingFromAgentRef = useRef(false);
  const lastAgentSnapshotRef = useRef<string>("");
  const setStateRef = useRef(setStateRaw);
  setStateRef.current = setStateRaw;
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (!state?.nodes) return;

    const snapshot = JSON.stringify({ nodes: state.nodes, edges: state.edges });

    if (hydrationRecord) {
      lastAgentSnapshotRef.current = snapshot;
      return;
    }

    if (snapshot === lastAgentSnapshotRef.current) return;
    lastAgentSnapshotRef.current = snapshot;

    syncingFromAgentRef.current = true;
    replaceCanvasState({
      nodes: toReactFlowNodes(state.nodes),
      edges: toReactFlowEdges(state.edges),
      selectedNodeId: state.selectedNodeId,
    });

    requestAnimationFrame(() => {
      syncingFromAgentRef.current = false;
    });
  }, [state?.nodes, state?.edges, state?.selectedNodeId, replaceCanvasState, hydrationRecord]);

  const setAgentState: AgentStateSetter = useCallback(
    (
      newState:
        | AgentCanvasState
        | ((prev: AgentCanvasState | undefined) => AgentCanvasState)
    ) => {
      setStateRef.current(newState);
    },
    []
  );

  const addNodeViaAgent = useCallback(
    (data: CanvasNodeData, sourceNodeId?: string): string => {
      const currentNodes = stateRef.current?.nodes ?? [];
      const currentEdges = stateRef.current?.edges ?? [];

      const rfNodes = toReactFlowNodes(currentNodes);
      const position = computePosition(rfNodes, sourceNodeId);
      const nodeId = generateNodeId(data.variant);

      const newAgentNode: AgentCanvasState["nodes"][number] = {
        id: nodeId,
        variant: data.variant,
        title: data.title,
        createdAt: data.createdAt,
        source: data.source,
        position,
        ...("content" in data &&
          data.content !== undefined && { content: data.content }),
        ...("plan" in data && data.plan !== undefined && { plan: data.plan }),
        ...("expectedOutcome" in data &&
          data.expectedOutcome !== undefined && {
            expectedOutcome: data.expectedOutcome,
          }),
        ...("description" in data &&
          data.description !== undefined && { description: data.description }),
        ...("chartSpec" in data &&
          data.chartSpec !== undefined && { chartSpec: data.chartSpec }),
        ...("sourceQuery" in data &&
          data.sourceQuery !== undefined && { sourceQuery: data.sourceQuery }),
      };

      const newEdges = sourceNodeId
        ? [
            ...currentEdges,
            {
              id: generateEdgeId(sourceNodeId, nodeId),
              source: sourceNodeId,
              target: nodeId,
            },
          ]
        : currentEdges;

      setStateRef.current({
        ...(stateRef.current ?? EMPTY_STATE),
        nodes: [...currentNodes, newAgentNode],
        edges: newEdges,
      });

      return nodeId;
    },
    []
  );

  return {
    agentState: state ?? EMPTY_STATE,
    setAgentState,
    addNodeViaAgent,
    running: false,
  };
};

export { toAgentNodes, toAgentEdges, toReactFlowNodes, toReactFlowEdges };

"use client";

import { useAgent } from "@copilotkit/react-core/v2";
import { useEffect, useRef } from "react";
import {
  extractCanvasFromAgentState,
  mergeAgentCanvasIntoStore,
} from "@/lib/agent-canvas-state";
import {
  canvasHydrationGate,
  registerCanvasAgentBridge,
} from "@/lib/canvas-agent-bridge";
import { useAppStore, type AppStore } from "@/state/store";
import type { SessionCanvasState } from "@/types/session";
import { isRecord } from "@/lib/utils";

const POSITION_DEBOUNCE_MS = 700;

const pickWorkspaceCanvas = (
  s: Pick<AppStore, "nodes" | "edges" | "selectedNodeId">
): SessionCanvasState => ({
  nodes: s.nodes,
  edges: s.edges,
  selectedNodeId: s.selectedNodeId,
});

const buildStructuralFingerprint = (s: SessionCanvasState): string => {
  const sortedNodes = [...s.nodes].sort((a, b) => a.id.localeCompare(b.id));
  const sortedEdges = [...s.edges].sort((a, b) => a.id.localeCompare(b.id));
  return JSON.stringify({
    nodes: sortedNodes.map((n) => ({
      id: n.id,
      type: n.type,
      data: n.data,
      width: n.width,
      height: n.height,
    })),
    edges: sortedEdges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle,
      targetHandle: e.targetHandle,
    })),
    selectedNodeId: s.selectedNodeId,
  });
};

const buildPositionsFingerprint = (s: SessionCanvasState): string => {
  const sortedNodes = [...s.nodes].sort((a, b) => a.id.localeCompare(b.id));
  return JSON.stringify(
    sortedNodes.map((n) => ({ id: n.id, position: n.position }))
  );
};

const mergeAgentStateWithCanvas = (
  prevState: unknown,
  canvas: SessionCanvasState
): Record<string, unknown> => {
  const base = isRecord(prevState) ? prevState : {};
  return { ...base, canvas };
};

/**
 * Bidirectional sync: Zustand workspace canvas ↔ Built-in Agent shared state (`canvas`).
 */
export const useCanvasAgentSharedState = () => {
  const { agent } = useAgent({ updates: [] });

  const applyingFromAgentRef = useRef(false);
  const lastPushedCanvasJsonRef = useRef<string>("");
  const positionDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const flushPositionDebounce = () => {
    if (positionDebounceRef.current !== null) {
      clearTimeout(positionDebounceRef.current);
      positionDebounceRef.current = null;
    }
  };

  useEffect(() => {
    const forcePushCanvasToAgent = (canvas: SessionCanvasState) => {
      const json = JSON.stringify(canvas);
      lastPushedCanvasJsonRef.current = json;
      applyingFromAgentRef.current = false;
      agent.setState(mergeAgentStateWithCanvas(agent.state, canvas));
    };

    return registerCanvasAgentBridge({
      syncCanvasToAgent: forcePushCanvasToAgent,
    });
  }, [agent]);

  useEffect(() => {
    const applyIncomingAgentState = (state: unknown) => {
      const current = pickWorkspaceCanvas(useAppStore.getState());

      if (canvasHydrationGate.isBlocked()) return;

      const incomingCanvas = extractCanvasFromAgentState(state);

      if (!incomingCanvas) return;

      const merged = mergeAgentCanvasIntoStore(current, incomingCanvas);

      if (JSON.stringify(merged) === JSON.stringify(current)) {
        return;
      }

      applyingFromAgentRef.current = true;
      useAppStore.getState().replaceCanvasState(merged);
      lastPushedCanvasJsonRef.current = JSON.stringify(merged);
      agent.setState(mergeAgentStateWithCanvas(agent.state, merged));

      queueMicrotask(() => {
        applyingFromAgentRef.current = false;
      });
    };

    const sub = agent.subscribe({
      onStateChanged: (event) => {
        applyIncomingAgentState(event.state);
      },
    });
    return () => sub.unsubscribe();
  }, [agent]);

  useEffect(() => {
    const pushCanvasFromStore = (canvas: SessionCanvasState) => {
      if (canvasHydrationGate.isBlocked()) return;
      if (applyingFromAgentRef.current) return;

      const json = JSON.stringify(canvas);
      if (json === lastPushedCanvasJsonRef.current) return;

      lastPushedCanvasJsonRef.current = json;
      agent.setState(mergeAgentStateWithCanvas(agent.state, canvas));
    };

    const unsub = useAppStore.subscribe((state, prevState) => {
      if (canvasHydrationGate.isBlocked()) return;
      if (applyingFromAgentRef.current) return;
      const canvas = pickWorkspaceCanvas(state);
      const prevCanvas = pickWorkspaceCanvas(prevState);
      const struct = buildStructuralFingerprint(canvas);
      const pos = buildPositionsFingerprint(canvas);
      const prevStruct = buildStructuralFingerprint(prevCanvas);
      const prevPos = buildPositionsFingerprint(prevCanvas);
      if (struct !== prevStruct) {
        flushPositionDebounce();
        pushCanvasFromStore(canvas);
        return;
      }
      if (pos !== prevPos) {
        flushPositionDebounce();
        positionDebounceRef.current = setTimeout(() => {
          positionDebounceRef.current = null;
          pushCanvasFromStore(pickWorkspaceCanvas(useAppStore.getState()));
        }, POSITION_DEBOUNCE_MS);
      }
    });

    pushCanvasFromStore(pickWorkspaceCanvas(useAppStore.getState()));

    return () => {
      flushPositionDebounce();
      unsub();
    };
  }, [agent]);
};

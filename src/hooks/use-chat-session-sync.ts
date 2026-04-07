"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { generateSessionMemorySummary } from "@/actions/generate-session-memory-summary";
import { getSessionSummaryContext } from "@/lib/session-memory";
import {
  saveActiveSessionSnapshot,
  setSessionMemorySummary,
  consumeHydrationRecord,
} from "@/lib/workflows/session-workflows";
import { useDatasetWorkflows } from "@/lib/workflows/dataset-workflows";
import {
  canvasHydrationGate,
  getCanvasAgentBridge,
} from "@/lib/canvas-agent-bridge";
import { serializeForStorage } from "@/lib/sessions";
import { useSelectedDatasets } from "@/hooks/use-datasets-state";
import { useAppStore } from "@/state/store";
import type { SessionSnapshotInput } from "@/types/session";
import { useAgent, useSuggestions } from "@copilotkit/react-core/v2";
import type { Message } from "@copilotkit/react-core/v2";

type CopilotkitStatus = "uninitialized" | "initializing" | "running" | "ready";

const useChatSessionSync = () => {
  const { agent } = useAgent();
  const { clearSuggestions, reloadSuggestions } = useSuggestions();
  const selectedDatasets = useSelectedDatasets();
  const { setSelectedDatasetIds } = useDatasetWorkflows();
  const activeSessionId = useAppStore((s) => s.activeSessionId);
  const hydrationRecord = useAppStore((s) => s.hydrationRecord);
  const resetVersion = useAppStore((s) => s.resetVersion);
  const isInitialized = useAppStore((s) => s.isInitialized);
  const copilotkitStatusRef = useRef<CopilotkitStatus>("uninitialized");
  const previousSummaryRef = useRef<string | null>(null);
  const previousSummaryMessagesLengthRef = useRef<number>(0);

  const activeSessionIdRef = useRef(activeSessionId);
  activeSessionIdRef.current = activeSessionId;
  const hydrationRecordRef = useRef(hydrationRecord);
  hydrationRecordRef.current = hydrationRecord;
  const selectedDatasetsRef = useRef(selectedDatasets);
  selectedDatasetsRef.current = selectedDatasets;
  const setSelectedDatasetIdsRef = useRef(setSelectedDatasetIds);
  setSelectedDatasetIdsRef.current = setSelectedDatasetIds;

  const isCopilotkitReady = copilotkitStatusRef.current === "ready";

  const serializedMessages = useMemo(
    () => serializeForStorage(agent.messages),
    [agent.messages]
  );

  const buildSnapshot = useCallback((): SessionSnapshotInput => {
    const { nodes, edges, selectedNodeId } = useAppStore.getState();
    return {
      messages: serializedMessages,
      canvas: { nodes, edges, selectedNodeId },
      selectedDatasetIds: selectedDatasets.map((dataset) => dataset.id),
      selectedDatasetNames: selectedDatasets.map((dataset) => dataset.name),
    };
  }, [serializedMessages, selectedDatasets]);

  const buildSnapshotRef = useRef(buildSnapshot);
  buildSnapshotRef.current = buildSnapshot;

  // Control copilotkit status changes
  useEffect(() => {
    const COPILOTKIT_TRANSITIONS = {
      uninitialized: { running: "initializing", idle: "uninitialized" },
      initializing: { running: "initializing", idle: "ready" },
      running: { running: "running", idle: "ready" },
      ready: { running: "running", idle: "ready" },
    } as const;
    const event = agent.isRunning ? "running" : "idle";
    const current = copilotkitStatusRef.current;
    const next = COPILOTKIT_TRANSITIONS[current][event];
    copilotkitStatusRef.current = next;
  }, [agent.isRunning]);

  // Hydrate session
  useEffect(() => {
    if (!isInitialized) return;
    if (!hydrationRecord) return;

    canvasHydrationGate.setBlocked(true);
    useAppStore.getState().replaceCanvasState(hydrationRecord.canvas);
    setSelectedDatasetIdsRef.current(hydrationRecord.selectedDatasetIds);

    if (isCopilotkitReady) {
      const hydratedMessages = hydrationRecord.messages as Message[];
      previousSummaryMessagesLengthRef.current = hydratedMessages.length;
      agent.setMessages(hydratedMessages);
      getCanvasAgentBridge()?.syncCanvasToAgent(hydrationRecord.canvas);
      canvasHydrationGate.setBlocked(false);
      consumeHydrationRecord();
      clearSuggestions();
      reloadSuggestions();
    }
  }, [
    agent,
    agent.isRunning,
    isCopilotkitReady,
    isInitialized,
    hydrationRecord,
    clearSuggestions,
    reloadSuggestions,
  ]);

  // Reset session
  useEffect(() => {
    if (!isInitialized) return;
    if (activeSessionId) return;
    if (hydrationRecord) return;

    previousSummaryRef.current = null;
    previousSummaryMessagesLengthRef.current = 0;

    canvasHydrationGate.setBlocked(true);
    agent.setMessages([]);
    useAppStore
      .getState()
      .replaceCanvasState({ nodes: [], edges: [], selectedNodeId: null });
    setSelectedDatasetIdsRef.current([]);
    getCanvasAgentBridge()?.syncCanvasToAgent({
      nodes: [],
      edges: [],
      selectedNodeId: null,
    });
    canvasHydrationGate.setBlocked(false);
    clearSuggestions();
  }, [
    agent,
    resetVersion,
    isInitialized,
    activeSessionId,
    hydrationRecord,
    clearSuggestions,
  ]);

  // Save active session snapshot (messages / dataset changes)
  useEffect(() => {
    if (!isInitialized) return;
    if (!activeSessionId) return;
    if (hydrationRecord) return;

    saveActiveSessionSnapshot(buildSnapshot());
  }, [activeSessionId, isInitialized, hydrationRecord, buildSnapshot]);

  // Save active session snapshot (canvas changes — Zustand subscription avoids re-renders)
  useEffect(() => {
    if (!isInitialized) return;

    const unsub = useAppStore.subscribe((state, prevState) => {
      if (
        state.nodes === prevState.nodes &&
        state.edges === prevState.edges &&
        state.selectedNodeId === prevState.selectedNodeId
      )
        return;

      const { activeSessionId: sessionId, hydrationRecord: hydration } =
        useAppStore.getState();
      if (!sessionId || hydration) return;

      saveActiveSessionSnapshot(buildSnapshotRef.current());
    });

    return unsub;
  }, [isInitialized]);

  // Persist session summary after each agent run
  useEffect(() => {
    const NO_SUMMARY = "No summary available.";

    const sub = agent.subscribe({
      onRunFinalized: async ({ messages }) => {
        const sessionId = activeSessionIdRef.current;
        if (!sessionId) return;
        if (hydrationRecordRef.current) return;
        if (messages.length <= previousSummaryMessagesLengthRef.current) return;
        previousSummaryMessagesLengthRef.current = messages.length;

        const lastMessage = messages[messages.length - 1];
        if (lastMessage?.role !== "assistant") return;
        if (lastMessage?.toolCalls && lastMessage.toolCalls.length > 0) return;

        const { nodes } = useAppStore.getState();
        const context = getSessionSummaryContext({
          messages,
          nodes,
          previousSummary: previousSummaryRef.current,
        });

        const generated = await generateSessionMemorySummary(context).catch(
          () => null
        );

        const summary = generated ?? previousSummaryRef.current ?? NO_SUMMARY;
        await setSessionMemorySummary(sessionId, summary);

        previousSummaryRef.current = summary;
      },
    });

    return () => sub.unsubscribe();
  }, [agent]);
};

export { useChatSessionSync };

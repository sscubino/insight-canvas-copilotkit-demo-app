"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { generateSessionTitle } from "@/actions/generate-session-title";
import { persistSessionMemorySummary } from "@/lib/workflows/session-memory-workflows";
import { useSessionWorkflows } from "@/lib/workflows/session-workflows";
import { useDatasetWorkflows } from "@/lib/workflows/dataset-workflows";
import {
  canvasHydrationGate,
  getCanvasAgentBridge,
} from "@/lib/canvas-agent-bridge";
import { serializeForStorage } from "@/lib/sessions";
import { useDatasetsState } from "@/state/hooks/use-datasets-state";
import { useSessionState } from "@/state/hooks/use-session-state";
import { useAppStore } from "@/state/store";
import type { SessionSnapshotInput } from "@/types/session";
import { getFirstUserPrompt } from "@/lib/copilotkit-chat";
import { Message, useAgent } from "@copilotkit/react-core/v2";

type CopilotkitStatus = "uninitialized" | "initializing" | "running" | "ready";

const useChatSessionSync = () => {
  const { agent } = useAgent();
  const replaceCanvasState = useAppStore((s) => s.replaceCanvasState);
  const { selectedDatasets } = useDatasetsState();
  const { setSelectedDatasetIds } = useDatasetWorkflows();
  const { activeSessionId, hydrationRecord, resetVersion, isInitialized } =
    useSessionState();
  const {
    createSessionFromFirstPrompt,
    saveActiveSessionSnapshot,
    setSessionName,
    setSessionMemorySummary,
    consumeHydrationRecord,
  } = useSessionWorkflows();

  const copilotkitStatusRef = useRef<CopilotkitStatus>("uninitialized");
  const previousSummaryRef = useRef<string | null>(null);
  const previousSummaryMessagesLengthRef = useRef<number>(0);

  // Always-current refs so the subscription effect only depends on `agent`
  const activeSessionIdRef = useRef(activeSessionId);
  activeSessionIdRef.current = activeSessionId;
  const hydrationRecordRef = useRef(hydrationRecord);
  hydrationRecordRef.current = hydrationRecord;
  const selectedDatasetsRef = useRef(selectedDatasets);
  selectedDatasetsRef.current = selectedDatasets;
  const setSessionMemorySummaryRef = useRef(setSessionMemorySummary);
  setSessionMemorySummaryRef.current = setSessionMemorySummary;

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
    replaceCanvasState(hydrationRecord.canvas);
    setSelectedDatasetIds(hydrationRecord.selectedDatasetIds);

    if (isCopilotkitReady) {
      const hydratedMessages = hydrationRecord.messages as Message[];
      previousSummaryMessagesLengthRef.current = hydratedMessages.length;
      agent.setMessages(hydratedMessages);
      getCanvasAgentBridge()?.syncCanvasToAgent(hydrationRecord.canvas);
      canvasHydrationGate.setBlocked(false);
      consumeHydrationRecord();
    }
  }, [
    agent,
    agent.isRunning,
    isCopilotkitReady,
    isInitialized,
    hydrationRecord,
    replaceCanvasState,
    setSelectedDatasetIds,
    consumeHydrationRecord,
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
    replaceCanvasState({ nodes: [], edges: [], selectedNodeId: null });
    setSelectedDatasetIds([]);
    getCanvasAgentBridge()?.syncCanvasToAgent({
      nodes: [],
      edges: [],
      selectedNodeId: null,
    });
    canvasHydrationGate.setBlocked(false);
  }, [
    agent,
    resetVersion,
    isInitialized,
    activeSessionId,
    hydrationRecord,
    replaceCanvasState,
    setSelectedDatasetIds,
  ]);

  // Save active session snapshot (messages / dataset changes)
  useEffect(() => {
    if (!isInitialized) return;
    if (!activeSessionId) return;
    if (hydrationRecord) return;

    saveActiveSessionSnapshot(buildSnapshot());
  }, [
    activeSessionId,
    isInitialized,
    hydrationRecord,
    buildSnapshot,
    saveActiveSessionSnapshot,
  ]);

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
  }, [isInitialized, saveActiveSessionSnapshot]);

  // Persist session summary after each agent run
  useEffect(() => {
    const sub = agent.subscribe({
      onRunFinalized: ({ messages }) => {
        const sessionId = activeSessionIdRef.current;
        if (!sessionId) return;
        if (hydrationRecordRef.current) return;
        if (messages.length <= previousSummaryMessagesLengthRef.current) return;

        const { nodes } = useAppStore.getState();
        void persistSessionMemorySummary({
          activeSessionId: sessionId,
          firstUserPrompt: getFirstUserPrompt(messages),
          messages,
          nodes,
          selectedDatasetNames: selectedDatasetsRef.current.map((d) => d.name),
          previousSummary: previousSummaryRef.current,
          setSessionMemorySummary: setSessionMemorySummaryRef.current,
        }).then((nextSummary) => {
          previousSummaryRef.current = nextSummary;
          previousSummaryMessagesLengthRef.current = messages.length;
        });
      },
    });

    return () => sub.unsubscribe();
  }, [agent]);

  const handleFirstPromptSessionCreate = async (prompt: string) => {
    if (activeSessionId) return;

    const sessionId = await createSessionFromFirstPrompt({
      firstPrompt: prompt,
      selectedDatasetIds: selectedDatasets.map((dataset) => dataset.id),
      snapshot: buildSnapshot(),
    });

    try {
      const title = await generateSessionTitle({
        firstPrompt: prompt,
        selectedDatasets: selectedDatasets.map((dataset) => dataset.name),
      });
      if (!title || title.trim().length === 0) return;
      await setSessionName(sessionId, title);
    } catch (error) {
      console.error("Failed to generate session title:", error);
    }
  };

  return { handleFirstPromptSessionCreate };
};

export { useChatSessionSync };

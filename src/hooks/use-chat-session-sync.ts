"use client";

import { useCallback, useEffect, useRef } from "react";
import { useCopilotChatInternal } from "@copilotkit/react-core";
import { generateSessionTitle } from "@/actions/generate-session-title";
import { persistSessionMemorySummary } from "@/lib/application/session-memory-workflows";
import { useSessionWorkflows } from "@/lib/application/session-workflows";
import { useDatasetWorkflows } from "@/lib/application/dataset-workflows";
import { serializeForStorage } from "@/lib/sessions";
import { useDatasetsState } from "@/state/hooks/use-datasets-state";
import { useSessionState } from "@/state/hooks/use-session-state";
import { useWorkspaceState } from "@/state/hooks/use-workspace-state";
import type { SessionSnapshotInput } from "@/types/session";
import { getFirstUserPrompt, type ChatMessages } from "@/lib/copilotkit-chat";

type CopilotkitStatus = "uninitialized" | "initializing" | "loading" | "ready";

const useChatSessionSync = () => {
  const { messages, setMessages, isLoading } = useCopilotChatInternal();
  const { nodes, edges, selectedNodeId, replaceCanvasState } =
    useWorkspaceState();
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
  const prevIsLoadingRef = useRef(false);
  const previousSummaryRef = useRef<string | null>(null);
  const previousSummaryMessagesLengthRef = useRef<number>(0);

  const isCopilotkitReady = copilotkitStatusRef.current === "ready";

  const buildSnapshot = useCallback((): SessionSnapshotInput => {
    return {
      messages: serializeForStorage(messages),
      canvas: { nodes, edges, selectedNodeId },
      selectedDatasetIds: selectedDatasets.map((dataset) => dataset.id),
      selectedDatasetNames: selectedDatasets.map((dataset) => dataset.name),
    };
  }, [messages, nodes, edges, selectedNodeId, selectedDatasets]);

  // Control copilotkit status changes
  useEffect(() => {
    if (copilotkitStatusRef.current === "ready") return;
    if (copilotkitStatusRef.current === "uninitialized") {
      copilotkitStatusRef.current = isLoading
        ? "initializing"
        : "uninitialized";
    } else {
      copilotkitStatusRef.current = isLoading ? "loading" : "ready";
    }
  }, [isLoading]);

  // Hydrate session
  useEffect(() => {
    if (!isInitialized) return;
    if (!hydrationRecord) return;

    replaceCanvasState(hydrationRecord.canvas);
    setSelectedDatasetIds(hydrationRecord.selectedDatasetIds);

    if (isCopilotkitReady) {
      const hydratedMessages = hydrationRecord.messages as ChatMessages;
      previousSummaryMessagesLengthRef.current = hydratedMessages.length;
      setMessages(hydratedMessages);
      consumeHydrationRecord();
    }
  }, [
    isCopilotkitReady,
    isInitialized,
    hydrationRecord,
    setMessages,
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
    setMessages([]);
    replaceCanvasState({ nodes: [], edges: [], selectedNodeId: null });
    setSelectedDatasetIds([]);
  }, [
    resetVersion,
    isInitialized,
    activeSessionId,
    hydrationRecord,
    setMessages,
    replaceCanvasState,
    setSelectedDatasetIds,
  ]);

  // Save active session snapshot
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

  // Persist session summary
  useEffect(() => {
    if (!isInitialized) return;
    if (!isCopilotkitReady) return;

    const wasLoading = prevIsLoadingRef.current;
    prevIsLoadingRef.current = isLoading;

    const justFinished = wasLoading && !isLoading;
    if (!justFinished || !activeSessionId) return;

    if (previousSummaryMessagesLengthRef.current >= messages.length) return;

    const persistGeneratedSummary = async () => {
      const firstUserPrompt = getFirstUserPrompt(messages);
      const nextSummary = await persistSessionMemorySummary({
        activeSessionId,
        firstUserPrompt,
        messages,
        nodes,
        selectedDatasetNames: selectedDatasets.map((dataset) => dataset.name),
        previousSummary: previousSummaryRef.current,
        setSessionMemorySummary,
      });
      previousSummaryRef.current = nextSummary;
    };

    void persistGeneratedSummary();
  }, [
    isLoading,
    activeSessionId,
    messages,
    nodes,
    selectedDatasets,
    isInitialized,
    hydrationRecord,
    isCopilotkitReady,
    setSessionMemorySummary,
  ]);

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

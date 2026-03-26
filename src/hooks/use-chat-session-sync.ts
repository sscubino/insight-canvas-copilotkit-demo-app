"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useCopilotChatInternal } from "@copilotkit/react-core";
import { useCanvasState } from "@/contexts/canvas-state-context";
import { useDatasets } from "@/contexts/dataset-context";
import { useSession } from "@/contexts/session-context";
import { generateSessionMemorySummary } from "@/actions/generate-session-memory-summary";
import { generateSessionTitle } from "@/actions/generate-session-title";
import { serializeForStorage } from "@/lib/sessions";
import {
  buildHeuristicSessionMemorySummary,
  getRecentMemoryConversationTurns,
  getRecentNodeTitles,
} from "@/lib/session-memory";
import type { SessionSnapshotInput } from "@/types/session";

type ChatMessages = ReturnType<typeof useCopilotChatInternal>["messages"];

const getMessageContentText = (message: ChatMessages[number]): string => {
  if (typeof message.content === "string") return message.content;
  if (
    message.content &&
    typeof message.content === "object" &&
    "text" in message.content
  ) {
    const content = message.content as { text?: unknown };
    return typeof content.text === "string" ? content.text : "";
  }
  return "";
};

const useChatSessionSync = () => {
  const { messages, setMessages, isLoading } = useCopilotChatInternal();
  const { nodes, edges, selectedNodeId, replaceCanvasState } = useCanvasState();
  const {
    selectedDatasets,
    openDrawer: openDatasetDrawer,
    closeDrawer: closeDatasetDrawer,
    setSelectedDatasetIds,
  } = useDatasets();
  const {
    activeSessionId,
    hydrationRecord,
    resetVersion,
    isInitialized,
    createSessionFromFirstPrompt,
    saveActiveSessionSnapshot,
    setSessionName,
    setSessionMemorySummary,
    consumeHydrationRecord,
  } = useSession();

  const { selectedDatasetIds, selectedDatasetNames } = useMemo(() => {
    return {
      selectedDatasetIds: selectedDatasets.map((dataset) => dataset.id),
      selectedDatasetNames: selectedDatasets.map((dataset) => dataset.name),
    };
  }, [selectedDatasets]);

  const prevIsLoadingRef = useRef(false);
  const previousSummaryRef = useRef<string | null>(null);

  const getFirstUserPrompt = useCallback((): string => {
    const firstUserMessage = messages.find(
      (message) => message.role === "user"
    );
    if (!firstUserMessage) return "";
    return getMessageContentText(firstUserMessage).trim();
  }, [messages]);

  const buildSnapshot = useCallback((): SessionSnapshotInput => {
    return {
      messages: serializeForStorage(messages),
      canvas: { nodes, edges, selectedNodeId },
      selectedDatasetIds,
      selectedDatasetNames,
    };
  }, [
    messages,
    nodes,
    edges,
    selectedNodeId,
    selectedDatasetIds,
    selectedDatasetNames,
  ]);

  useEffect(() => {
    if (!hydrationRecord) return;

    previousSummaryRef.current = hydrationRecord.memorySummary?.trim() || null;
    setMessages(hydrationRecord.messages as ChatMessages);
    replaceCanvasState(hydrationRecord.canvas);
    setSelectedDatasetIds(hydrationRecord.selectedDatasetIds);

    if (hydrationRecord.selectedDatasetIds.length === 0) {
      openDatasetDrawer();
    } else {
      closeDatasetDrawer();
    }

    consumeHydrationRecord();
  }, [
    hydrationRecord,
    setMessages,
    replaceCanvasState,
    setSelectedDatasetIds,
    consumeHydrationRecord,
    openDatasetDrawer,
    closeDatasetDrawer,
  ]);

  useEffect(() => {
    if (!isInitialized) return;
    if (activeSessionId) return;
    if (hydrationRecord) return;

    previousSummaryRef.current = null;
    setMessages([]);
    replaceCanvasState({ nodes: [], edges: [], selectedNodeId: null });
    setSelectedDatasetIds([]);
    openDatasetDrawer();
  }, [
    resetVersion,
    isInitialized,
    activeSessionId,
    hydrationRecord,
    setMessages,
    replaceCanvasState,
    setSelectedDatasetIds,
    openDatasetDrawer,
  ]);

  useEffect(() => {
    if (!isInitialized) return;
    if (!activeSessionId) return;
    if (hydrationRecord) return;

    saveActiveSessionSnapshot(buildSnapshot());
  }, [
    activeSessionId,
    isInitialized,
    hydrationRecord,
    getFirstUserPrompt,
    buildSnapshot,
    saveActiveSessionSnapshot,
  ]);

  useEffect(() => {
    const wasLoading = prevIsLoadingRef.current;
    prevIsLoadingRef.current = isLoading;

    const justFinished = wasLoading && !isLoading;
    if (!justFinished || !activeSessionId) return;

    const persistGeneratedSummary = async () => {
      const firstUserPrompt = getFirstUserPrompt();
      const serializedMessages = serializeForStorage(messages);
      const fallbackSummary = buildHeuristicSessionMemorySummary({
        prompt: firstUserPrompt,
        selectedDatasetNames,
        nodes,
      });

      try {
        const generatedSummary = await generateSessionMemorySummary({
          firstPrompt: firstUserPrompt,
          selectedDatasets: selectedDatasetNames,
          previousSummary: previousSummaryRef.current ?? undefined,
          recentConversation: getRecentMemoryConversationTurns(
            serializedMessages as unknown[]
          ),
          recentNodeTitles: getRecentNodeTitles(nodes),
        });
        const nextSummary = generatedSummary ?? fallbackSummary;
        previousSummaryRef.current = nextSummary;

        setSessionMemorySummary(activeSessionId, nextSummary);
      } catch {
        previousSummaryRef.current = fallbackSummary;
        setSessionMemorySummary(activeSessionId, fallbackSummary);
      }
    };

    void persistGeneratedSummary();
  }, [
    isLoading,
    activeSessionId,
    messages,
    nodes,
    selectedDatasetNames,
    buildSnapshot,
    setSessionMemorySummary,
    getFirstUserPrompt,
  ]);

  const handleFirstPromptSessionCreate = async (prompt: string) => {
    if (activeSessionId) return;

    const sessionId = await createSessionFromFirstPrompt({
      firstPrompt: prompt,
      selectedDatasetIds,
      snapshot: buildSnapshot(),
    });

    try {
      const title = await generateSessionTitle({
        firstPrompt: prompt,
        selectedDatasets: selectedDatasetNames,
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

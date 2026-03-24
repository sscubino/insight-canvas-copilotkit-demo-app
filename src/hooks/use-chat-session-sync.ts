"use client";

import { useCallback, useEffect } from "react";
import { useCopilotChatInternal } from "@copilotkit/react-core";
import { useCanvasState } from "@/contexts/canvas-state-context";
import { useDatasets } from "@/contexts/dataset-context";
import { useSession } from "@/contexts/session-context";
import { generateSessionTitle } from "@/actions/generate-session-title";
import { buildSessionMemorySummary, serializeForStorage } from "@/lib/sessions";
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
  const { messages, setMessages } = useCopilotChatInternal();
  const { nodes, edges, selectedNodeId, replaceCanvasState } = useCanvasState();
  const { selectedDatasets, setSelectedDatasetIds } = useDatasets();
  const {
    activeSessionId,
    hydrationRecord,
    resetVersion,
    isInitialized,
    createSessionFromFirstPrompt,
    saveActiveSessionSnapshot,
    setSessionName,
    consumeHydrationRecord,
  } = useSession();

  const selectedDatasetIds = selectedDatasets.map((dataset) => dataset.id);
  const selectedDatasetNames = selectedDatasets.map((dataset) => dataset.name);

  const buildSnapshot = useCallback(
    (prompt: string): SessionSnapshotInput => {
      return {
        messages: serializeForStorage(messages),
        canvas: { nodes, edges, selectedNodeId },
        selectedDatasetIds,
        selectedDatasetNames,
        memorySummary: buildSessionMemorySummary({
          prompt,
          selectedDatasetNames,
          nodes,
        }),
      };
    },
    [messages, nodes, edges, selectedNodeId, selectedDatasetIds, selectedDatasetNames]
  );

  useEffect(() => {
    if (!hydrationRecord) return;

    setMessages(hydrationRecord.messages as ChatMessages);
    replaceCanvasState(hydrationRecord.canvas);
    setSelectedDatasetIds(hydrationRecord.selectedDatasetIds);
    consumeHydrationRecord();
  }, [
    hydrationRecord,
    setMessages,
    replaceCanvasState,
    setSelectedDatasetIds,
    consumeHydrationRecord,
  ]);

  useEffect(() => {
    if (!isInitialized) return;
    if (activeSessionId) return;

    setMessages([]);
    replaceCanvasState({ nodes: [], edges: [], selectedNodeId: null });
    setSelectedDatasetIds([]);
  }, [
    resetVersion,
    isInitialized,
    activeSessionId,
    setMessages,
    replaceCanvasState,
    setSelectedDatasetIds,
  ]);

  useEffect(() => {
    if (!activeSessionId) return;

    const firstUserMessage = messages.find((message) => message.role === "user");
    const firstUserPrompt = firstUserMessage
      ? getMessageContentText(firstUserMessage).trim()
      : "";
    saveActiveSessionSnapshot(buildSnapshot(firstUserPrompt));
  }, [
    activeSessionId,
    messages,
    buildSnapshot,
    saveActiveSessionSnapshot,
  ]);

  const handleFirstPromptSessionCreate = async (prompt: string) => {
    if (activeSessionId) return;

    const sessionId = await createSessionFromFirstPrompt({
      firstPrompt: prompt,
      selectedDatasetIds,
      snapshot: buildSnapshot(prompt),
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

"use client";

import { generateSessionMemorySummary } from "@/actions/generate-session-memory-summary";
import {
  buildHeuristicSessionMemorySummary,
  getRecentMemoryConversationTurns,
  getRecentNodeTitles,
} from "@/lib/session-memory";
import { serializeForStorage } from "@/lib/sessions";
import type { CanvasNode } from "@/types/canvas";

type PersistSessionMemorySummaryArgs = {
  activeSessionId: string;
  firstUserPrompt: string;
  messages: unknown[];
  nodes: CanvasNode[];
  selectedDatasetNames: string[];
  previousSummary: string | null;
  setSessionMemorySummary: (sessionId: string, summary: string) => Promise<void>;
};

export const persistSessionMemorySummary = async ({
  activeSessionId,
  firstUserPrompt,
  messages,
  nodes,
  selectedDatasetNames,
  previousSummary,
  setSessionMemorySummary,
}: PersistSessionMemorySummaryArgs): Promise<string> => {
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
      previousSummary: previousSummary ?? undefined,
      recentConversation: getRecentMemoryConversationTurns(
        serializedMessages as unknown[]
      ),
      recentNodeTitles: getRecentNodeTitles(nodes),
    });

    const nextSummary = generatedSummary ?? fallbackSummary;
    await setSessionMemorySummary(activeSessionId, nextSummary);
    return nextSummary;
  } catch {
    await setSessionMemorySummary(activeSessionId, fallbackSummary);
    return fallbackSummary;
  }
};

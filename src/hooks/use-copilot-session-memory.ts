"use client";

import { useEffect, useMemo, useState } from "react";
import { useCopilotReadable } from "@copilotkit/react-core";
import { useSession } from "@/contexts/session-context";
import { getSessionRecord } from "@/lib/session-storage";

const MAX_MEMORY_SESSIONS = 5;
const MAX_SUMMARY_LENGTH = 280;

const clampText = (text: string, limit: number): string => {
  if (text.length <= limit) return text;
  return `${text.slice(0, limit - 3).trimEnd()}...`;
};

const useCopilotSessionMemory = () => {
  const { sessions, activeSessionId } = useSession();
  const [memoryText, setMemoryText] = useState("No previous sessions yet.");

  const candidateSessionIds = useMemo(() => {
    return sessions
      .filter((session) => session.id !== activeSessionId)
      .slice(0, MAX_MEMORY_SESSIONS)
      .map((session) => session.id);
  }, [sessions, activeSessionId]);

  useEffect(() => {
    if (candidateSessionIds.length === 0) {
      setMemoryText("No previous sessions yet.");
      return;
    }

    const loadSessionMemory = async () => {
      const records = await Promise.all(
        candidateSessionIds.map((id) => getSessionRecord(id))
      );

      const compact = records
        .filter((record): record is NonNullable<typeof record> =>
          Boolean(record)
        )
        .map((record) => {
          const summary = clampText(
            record.memorySummary || "",
            MAX_SUMMARY_LENGTH
          );
          const selectedDatasetNames = record.selectedDatasetNames ?? [];
          const selectedDatasetIds = record.selectedDatasetIds ?? [];
          const datasets =
            selectedDatasetNames.length > 0
              ? selectedDatasetNames.join(", ")
              : selectedDatasetIds.length > 0
                ? selectedDatasetIds.join(", ")
                : "none";

          return [
            `Session: ${record.name}`,
            `Datasets: ${datasets}`,
            `First prompt: ${clampText(record.firstPrompt, 120)}`,
            `Summary: ${summary || "No summary available."}`,
          ].join("\n");
        });

      setMemoryText(
        compact.length > 0
          ? compact.join("\n\n---\n\n")
          : "No previous sessions yet."
      );
    };

    void loadSessionMemory();
  }, [candidateSessionIds]);

  useCopilotReadable({
    description:
      "Compact memory from previous sessions (excluding the current active session). Use it as context for continuity when relevant.",
    value: memoryText,
  });
};

export { useCopilotSessionMemory };

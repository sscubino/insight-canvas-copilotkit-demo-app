import { SessionListItem, SessionRecord } from "@/types/session";
import type { CanvasNode } from "@/types/canvas";

export const buildDefaultSessionName = (prompt: string): string => {
  const trimmedPrompt = prompt.trim();
  if (trimmedPrompt.length === 0) return "New analysis";
  if (trimmedPrompt.length <= 48) return trimmedPrompt;
  return `${trimmedPrompt.slice(0, 45).trimEnd()}...`;
};

const sessionRecordToListItem = (record: SessionRecord): SessionListItem => {
  return {
    id: record.id,
    name: record.name,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
};

export const upsertSessionInList = (
  record: SessionRecord,
  sessions: SessionListItem[]
): SessionListItem[] => {
  const listItem = sessionRecordToListItem(record);
  const existingIndex = sessions.findIndex((item) => item.id === record.id);
  const next =
    existingIndex >= 0
      ? sessions.map((item) => (item.id === record.id ? listItem : item))
      : [listItem, ...sessions];

  return next;
};

export const serializeForStorage = <T>(value: T): T => {
  return JSON.parse(
    JSON.stringify(value, (_key, item) => {
      if (typeof item === "function") return undefined;
      return item;
    })
  ) as T;
};

export const buildSessionMemorySummary = ({
  prompt,
  selectedDatasetNames,
  nodes,
}: {
  prompt: string;
  selectedDatasetNames: string[];
  nodes: CanvasNode[];
}): string => {
  const datasetSummary =
    selectedDatasetNames.length > 0
      ? selectedDatasetNames.join(", ")
      : "No dataset selected";

  const nodeTitles = nodes
    .slice(-3)
    .map((node) => node.data.title)
    .filter(Boolean)
    .join(" | ");

  if (nodeTitles.length === 0) {
    return `Prompt: ${prompt}\nDatasets: ${datasetSummary}`;
  }

  return `Prompt: ${prompt}\nDatasets: ${datasetSummary}\nRecent nodes: ${nodeTitles}`;
};

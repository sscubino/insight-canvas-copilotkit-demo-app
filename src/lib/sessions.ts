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

type MemoryConversationTurn = {
  role: "user" | "assistant";
  content: string;
};

const MAX_RECENT_MEMORY_TURNS = 6;
const MAX_MESSAGE_CONTENT_LENGTH = 320;
const MAX_RECENT_NODE_TITLES = 5;

const clampText = (text: string, limit: number): string => {
  if (text.length <= limit) return text;
  return `${text.slice(0, limit - 3).trimEnd()}...`;
};

const getMessageContentText = (content: unknown): string => {
  if (typeof content === "string") return content;
  if (
    content &&
    typeof content === "object" &&
    "text" in (content as Record<string, unknown>)
  ) {
    const contentWithText = content as { text?: unknown };
    return typeof contentWithText.text === "string" ? contentWithText.text : "";
  }
  return "";
};

export const getRecentMemoryConversationTurns = (
  messages: unknown[]
): MemoryConversationTurn[] => {
  return messages
    .map((message) => message as { role?: unknown; content?: unknown })
    .filter(
      (message) => message.role === "user" || message.role === "assistant"
    )
    .map((message) => ({
      role: message.role as "user" | "assistant",
      content: clampText(
        getMessageContentText(message.content).trim(),
        MAX_MESSAGE_CONTENT_LENGTH
      ),
    }))
    .filter((message) => message.content.length > 0)
    .slice(-MAX_RECENT_MEMORY_TURNS);
};

export const getRecentNodeTitles = (nodes: CanvasNode[]): string[] => {
  return nodes
    .slice(-MAX_RECENT_NODE_TITLES)
    .map((node) => node.data.title.trim())
    .filter(Boolean);
};

export const buildHeuristicSessionMemorySummary = ({
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

  const nodeTitles = getRecentNodeTitles(nodes).join(" | ");

  if (nodeTitles.length === 0) {
    return `Prompt: ${prompt}\nDatasets: ${datasetSummary}`;
  }

  return `Prompt: ${prompt}\nDatasets: ${datasetSummary}\nRecent nodes: ${nodeTitles}`;
};

export const buildSessionMemorySummary = buildHeuristicSessionMemorySummary;

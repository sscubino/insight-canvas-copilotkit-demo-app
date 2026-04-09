import type { CanvasNode, CanvasNodeData } from "@/types/canvas";
import { clampText, isRecord } from "@/lib/utils";
import { getFirstUserPrompt } from "@/lib/copilotkit-chat";
import { serializeForStorage } from "@/lib/sessions";
import { Message } from "@copilotkit/react-core/v2";

export type MemoryConversationTurn = {
  role: "user" | "assistant";
  content: string;
};

export type RelevantNode = {
  variant: string;
  title: string;
  content: string;
};

const MAX_RECENT_MEMORY_TURNS = 4;
const MAX_MESSAGE_CONTENT_LENGTH = 2400;
const MAX_RELEVANT_NODES = 6;

const RELEVANT_NODE_VARIANTS = new Set([
  "insight",
  "hypothesis",
  "question",
  "experiment",
]);

const getNodeContent = (data: CanvasNodeData): string => {
  if (data.variant === "experiment") {
    return [data.plan, data.expectedOutcome].filter(Boolean).join(" / ");
  }
  if ("content" in data) return data.content;
  return "";
};

const getMessageContentText = (content: unknown): string => {
  if (typeof content === "string") return content;
  if (isRecord(content) && "text" in content) {
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

export const getRelevantNodeContent = (nodes: CanvasNode[]): RelevantNode[] => {
  return nodes
    .filter((node) => RELEVANT_NODE_VARIANTS.has(node.data.variant))
    .slice(-MAX_RELEVANT_NODES)
    .map((node) => ({
      variant: node.data.variant,
      title: node.data.title.trim(),
      content: getNodeContent(node.data),
    }))
    .filter((node) => node.title.length > 0);
};

export type SessionSummaryContext = {
  firstPrompt: string;
  previousSummary?: string;
  recentConversation: MemoryConversationTurn[];
  relevantNodes: RelevantNode[];
};

export const getSessionSummaryContext = ({
  messages,
  nodes,
  previousSummary,
}: {
  messages: unknown[];
  nodes: CanvasNode[];
  previousSummary: string | null;
}): SessionSummaryContext => {
  const serialized = serializeForStorage(messages) as unknown[];
  return {
    firstPrompt: getFirstUserPrompt(messages as Message[]),
    previousSummary: previousSummary ?? undefined,
    recentConversation: getRecentMemoryConversationTurns(serialized),
    relevantNodes: getRelevantNodeContent(nodes),
  };
};

export const buildMessagesSummaryFingerprint = (
  messages: Message[]
): string => {
  const last = messages[messages.length - 1];
  const id = last?.id ?? "";
  return `${messages.length}:${id}`;
};

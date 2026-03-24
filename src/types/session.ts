import type { CanvasEdge, CanvasNode } from "@/types/canvas";

export type SessionCanvasState = {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  selectedNodeId: string | null;
};

export type SessionRecord = {
  id: string;
  threadId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  firstPrompt: string;
  selectedDatasetIds: string[];
  selectedDatasetNames: string[];
  messages: unknown[];
  canvas: SessionCanvasState;
  memorySummary: string;
};

export type SessionListItem = Pick<
  SessionRecord,
  "id" | "name" | "createdAt" | "updatedAt"
>;

export type SessionSnapshotInput = {
  messages: unknown[];
  canvas: SessionCanvasState;
  selectedDatasetIds: string[];
  selectedDatasetNames: string[];
  memorySummary: string;
};

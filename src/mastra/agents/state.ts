import { z } from "zod";

const AgentNodeSchema = z.object({
  id: z.string(),
  variant: z.enum([
    "chart",
    "insight",
    "hypothesis",
    "experiment",
    "action_item",
    "question",
  ]),
  title: z.string(),
  content: z.string().optional(),
  plan: z.string().optional(),
  expectedOutcome: z.string().optional(),
  description: z.string().optional(),
  chartSpec: z.record(z.string(), z.unknown()).optional(),
  sourceQuery: z.string().optional(),
  position: z.object({ x: z.number(), y: z.number() }).optional(),
  source: z.enum(["agent", "user"]),
  createdAt: z.string(),
});

const AgentEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
});

export const AgentCanvasStateSchema = z.object({
  nodes: z.array(AgentNodeSchema).default([]),
  edges: z.array(AgentEdgeSchema).default([]),
  selectedNodeId: z.string().nullable().default(null),
});

export type AgentCanvasState = z.infer<typeof AgentCanvasStateSchema>;

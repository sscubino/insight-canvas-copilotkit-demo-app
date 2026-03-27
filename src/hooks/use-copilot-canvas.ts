"use client";

import {
  useAgentContext,
  useFrontendTool,
} from "@copilotkit/react-core/v2";
import { z } from "zod";
import { NODE_VARIANTS } from "@/constants/nodes-config";
import { useWorkspaceState } from "@/state/hooks/use-workspace-state";
import type { NodeSource } from "@/types/canvas";
import { joinWithConjunction } from "@/lib/utils";

const nodeVariantSchema = z.enum(NODE_VARIANTS);

const addCanvasNodeParameters = z.object({
  variant: nodeVariantSchema.describe(
    `The type of reasoning artifact: ${joinWithConjunction(NODE_VARIANTS, "or")}`
  ),
  title: z.string().describe("A concise title for the node (max ~60 chars)"),
  content: z
    .string()
    .optional()
    .describe(
      "Main text content for insight, hypothesis, action_item, or question nodes. Keep it short (~140 chars)."
    ),
  plan: z
    .string()
    .optional()
    .describe(
      "Test plan description (only for experiment nodes). Keep it short (~140 chars)."
    ),
  expectedOutcome: z
    .string()
    .optional()
    .describe(
      "Expected outcome with success metrics (only for experiment nodes). Keep it short (~140 chars)."
    ),
  description: z
    .string()
    .optional()
    .describe(
      "Chart description (only for chart nodes). Keep it short (~140 chars)."
    ),
  chartSpec: z
    .string()
    .optional()
    .describe(
      "Vega-Lite v5 JSON spec as a string (only for chart nodes). Prefer using the generate_chart tool instead for better UX."
    ),
  sourceQuery: z
    .string()
    .optional()
    .describe(
      "The SQL query used to produce chart data (only for chart nodes)"
    ),
  sourceNodeId: z
    .string()
    .optional()
    .describe(
      "ID of an existing node to connect FROM. The new node will be placed adjacent to it and an edge will be created automatically."
    ),
});

const updateCanvasNodeParameters = z.object({
  nodeId: z.string().describe("The ID of the node to update"),
  title: z.string().optional().describe("New title for the node"),
  content: z
    .string()
    .optional()
    .describe("New content (for insight, hypothesis, action_item, question)"),
  plan: z
    .string()
    .optional()
    .describe("New plan text (for experiment nodes)"),
  expectedOutcome: z
    .string()
    .optional()
    .describe("New expected outcome (for experiment nodes)"),
});

const removeCanvasNodeParameters = z.object({
  nodeId: z.string().describe("The ID of the node to remove"),
});

const connectNodesParameters = z.object({
  sourceNodeId: z
    .string()
    .describe("The ID of the source node (upstream in reasoning)"),
  targetNodeId: z
    .string()
    .describe("The ID of the target node (downstream in reasoning)"),
});

const serializeNodesForAgent = (
  nodes: ReturnType<typeof useWorkspaceState>["nodes"]
): string => {
  if (nodes.length === 0) return "No nodes on canvas yet.";

  return nodes
    .map((node) => {
      const d = node.data;
      const parts = [`[${d.variant}] id="${node.id}" title="${d.title}"`];

      if ("content" in d && d.content) parts.push(`content="${d.content}"`);
      if ("plan" in d && d.plan) parts.push(`plan="${d.plan}"`);
      if ("expectedOutcome" in d && d.expectedOutcome)
        parts.push(`expectedOutcome="${d.expectedOutcome}"`);
      if ("description" in d && d.description)
        parts.push(`description="${d.description}"`);

      return parts.join(" | ");
    })
    .join("\n");
};

const serializeEdgesForAgent = (
  edges: ReturnType<typeof useWorkspaceState>["edges"]
): string => {
  if (edges.length === 0) return "No connections yet.";
  return edges.map((e) => `${e.source} → ${e.target}`).join("\n");
};

export const useCopilotCanvas = () => {
  const { nodes, edges, addNode, updateNode, removeNode, addEdge } =
    useWorkspaceState();

  const nodesContextText = serializeNodesForAgent(nodes);
  const edgesContextText = serializeEdgesForAgent(edges);

  useAgentContext({
    description:
      "Current reasoning nodes on the Insight Canvas. Each node is a reasoning artifact (chart, insight, hypothesis, experiment, action_item, or question).",
    value: nodesContextText,
  });

  useAgentContext({
    description:
      "Current edges (connections) between canvas nodes, showing the reasoning chain. Format: sourceId → targetId.",
    value: edgesContextText,
  });

  const workspaceDeps = [addNode, updateNode, removeNode, addEdge] as const;

  useFrontendTool(
    {
      name: "add_canvas_node",
      description:
        "Add a new reasoning artifact node to the canvas. Always connect related nodes by providing sourceNodeId. The node will be auto-positioned relative to its source.",
      parameters: addCanvasNodeParameters,
      handler: async ({
        variant,
        title,
        content,
        plan,
        expectedOutcome,
        description,
        chartSpec,
        sourceQuery,
        sourceNodeId,
      }) => {
        const now = new Date().toISOString();
        const source: NodeSource = "agent";

        let data;
        switch (variant) {
          case "chart": {
            let parsedSpec: Record<string, unknown> | undefined;
            if (chartSpec) {
              try {
                parsedSpec = JSON.parse(chartSpec);
              } catch {
                parsedSpec = undefined;
              }
            }
            data = {
              variant: "chart" as const,
              title,
              createdAt: now,
              source,
              description,
              chartSpec: parsedSpec,
              sourceQuery,
            };
            break;
          }
          case "experiment":
            data = {
              variant: "experiment" as const,
              title,
              createdAt: now,
              source,
              plan: plan ?? "",
              expectedOutcome: expectedOutcome ?? "",
            };
            break;
          default:
            data = {
              variant: variant as
                | "insight"
                | "hypothesis"
                | "action_item"
                | "question",
              title,
              createdAt: now,
              source,
              content: content ?? "",
            };
            break;
        }

        const newId = addNode(data, sourceNodeId);
        return `Created ${variant} node "${title}" with id="${newId}"`;
      },
    },
    [...workspaceDeps]
  );

  useFrontendTool(
    {
      name: "update_canvas_node",
      description:
        "Update the content of an existing canvas node. Only provide the fields you want to change.",
      parameters: updateCanvasNodeParameters,
      handler: async ({ nodeId, title, content, plan, expectedOutcome }) => {
        const updates: Record<string, unknown> = {};
        if (title !== undefined) updates.title = title;
        if (content !== undefined) updates.content = content;
        if (plan !== undefined) updates.plan = plan;
        if (expectedOutcome !== undefined)
          updates.expectedOutcome = expectedOutcome;

        updateNode(nodeId, updates);
        return `Updated node "${nodeId}"`;
      },
    },
    [...workspaceDeps]
  );

  useFrontendTool(
    {
      name: "remove_canvas_node",
      description:
        "Remove a node from the canvas. Also removes all edges connected to it.",
      parameters: removeCanvasNodeParameters,
      handler: async ({ nodeId }) => {
        removeNode(nodeId);
        return `Removed node "${nodeId}" and its connections`;
      },
    },
    [...workspaceDeps]
  );

  useFrontendTool(
    {
      name: "connect_nodes",
      description:
        "Create a directed edge between two existing nodes to represent a reasoning chain relationship (e.g., Chart → Insight → Hypothesis).",
      parameters: connectNodesParameters,
      handler: async ({ sourceNodeId, targetNodeId }) => {
        addEdge(sourceNodeId, targetNodeId);
        return `Connected "${sourceNodeId}" → "${targetNodeId}"`;
      },
    },
    [...workspaceDeps]
  );
};

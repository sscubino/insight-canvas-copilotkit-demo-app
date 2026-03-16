"use client";

import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import { NODE_VARIANTS } from "@/constants/nodes-config";
import { useCanvasState } from "@/contexts/canvas-state-context";
import type { NodeSource } from "@/types/canvas";
import { joinWithConjunction } from "@/lib/utils";

const serializeNodesForAgent = (
  nodes: ReturnType<typeof useCanvasState>["nodes"]
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
  edges: ReturnType<typeof useCanvasState>["edges"]
): string => {
  if (edges.length === 0) return "No connections yet.";
  return edges.map((e) => `${e.source} → ${e.target}`).join("\n");
};

export const useCopilotCanvas = () => {
  const { nodes, edges, addNode, updateNode, removeNode, addEdge } =
    useCanvasState();

  useCopilotReadable({
    description:
      "Current reasoning nodes on the Insight Canvas. Each node is a reasoning artifact (chart, insight, hypothesis, experiment, action_item, or question).",
    value: serializeNodesForAgent(nodes),
  });

  useCopilotReadable({
    description:
      "Current edges (connections) between canvas nodes, showing the reasoning chain. Format: sourceId → targetId.",
    value: serializeEdgesForAgent(edges),
  });

  useCopilotAction({
    name: "add_canvas_node",
    description:
      "Add a new reasoning artifact node to the canvas. Always connect related nodes by providing sourceNodeId. The node will be auto-positioned relative to its source.",
    parameters: [
      {
        name: "variant",
        type: "string",
        description: `The type of reasoning artifact: ${joinWithConjunction(NODE_VARIANTS, "or")}`,
        required: true,
        enum: [...NODE_VARIANTS],
      },
      {
        name: "title",
        type: "string",
        description: "A concise title for the node (max ~60 chars)",
        required: true,
      },
      {
        name: "content",
        type: "string",
        description:
          "Main text content for insight, hypothesis, action_item, or question nodes. Keep it short (~140 chars).",
      },
      {
        name: "plan",
        type: "string",
        description:
          "Test plan description (only for experiment nodes). Keep it short (~140 chars).",
      },
      {
        name: "expectedOutcome",
        type: "string",
        description:
          "Expected outcome with success metrics (only for experiment nodes). Keep it short (~140 chars).",
      },
      {
        name: "description",
        type: "string",
        description:
          "Chart description (only for chart nodes). Keep it short (~140 chars).",
      },
      {
        name: "chartSpec",
        type: "string",
        description:
          "Vega-Lite v5 JSON spec as a string (only for chart nodes). Prefer using the generate_chart tool instead for better UX.",
      },
      {
        name: "sourceQuery",
        type: "string",
        description:
          "The SQL query used to produce chart data (only for chart nodes)",
      },
      {
        name: "sourceNodeId",
        type: "string",
        description:
          "ID of an existing node to connect FROM. The new node will be placed adjacent to it and an edge will be created automatically.",
      },
    ],
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
  });

  useCopilotAction({
    name: "update_canvas_node",
    description:
      "Update the content of an existing canvas node. Only provide the fields you want to change.",
    parameters: [
      {
        name: "nodeId",
        type: "string",
        description: "The ID of the node to update",
        required: true,
      },
      {
        name: "title",
        type: "string",
        description: "New title for the node",
      },
      {
        name: "content",
        type: "string",
        description:
          "New content (for insight, hypothesis, action_item, question)",
      },
      {
        name: "plan",
        type: "string",
        description: "New plan text (for experiment nodes)",
      },
      {
        name: "expectedOutcome",
        type: "string",
        description: "New expected outcome (for experiment nodes)",
      },
    ],
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
  });

  useCopilotAction({
    name: "remove_canvas_node",
    description:
      "Remove a node from the canvas. Also removes all edges connected to it.",
    parameters: [
      {
        name: "nodeId",
        type: "string",
        description: "The ID of the node to remove",
        required: true,
      },
    ],
    handler: async ({ nodeId }) => {
      removeNode(nodeId);
      return `Removed node "${nodeId}" and its connections`;
    },
  });

  useCopilotAction({
    name: "connect_nodes",
    description:
      "Create a directed edge between two existing nodes to represent a reasoning chain relationship (e.g., Chart → Insight → Hypothesis).",
    parameters: [
      {
        name: "sourceNodeId",
        type: "string",
        description: "The ID of the source node (upstream in reasoning)",
        required: true,
      },
      {
        name: "targetNodeId",
        type: "string",
        description: "The ID of the target node (downstream in reasoning)",
        required: true,
      },
    ],
    handler: async ({ sourceNodeId, targetNodeId }) => {
      addEdge(sourceNodeId, targetNodeId);
      return `Connected "${sourceNodeId}" → "${targetNodeId}"`;
    },
  });
};

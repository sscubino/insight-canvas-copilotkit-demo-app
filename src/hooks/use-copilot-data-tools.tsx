"use client";

import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import { useDuckDB } from "@/contexts/duckdb-context";
import { useWorkspaceState } from "@/state/hooks/use-workspace-state";
import {
  QueryRunningStatus,
  QueryFallbackStatus,
  QueryResultTable,
  ChartGeneratingStatus,
  ChartCreatedStatus,
} from "@/components/chat/data-tool-renders";
import type { DatasetSchema, QueryResult } from "@/types/duckdb";
import type { NodeSource } from "@/types/canvas";

const formatSchemaForAgent = (schema: DatasetSchema): string => {
  const columnsDesc = schema.columns
    .map((col) => `  - ${col.name} (${col.type})`)
    .join("\n");

  return `Table "${schema.tableName}" (${schema.rowCount} rows):\n${columnsDesc}`;
};

const formatSchemasForAgent = (schemas: DatasetSchema[]): string => {
  if (schemas.length === 0) return "No datasets loaded yet.";
  return schemas.map(formatSchemaForAgent).join("\n\n");
};

export const useCopilotDataTools = (schemas: DatasetSchema[]) => {
  const { runQuery } = useDuckDB();
  const { addNode } = useWorkspaceState();

  useCopilotReadable({
    description:
      "The dataset schemas currently loaded in DuckDB. Use these to write correct SQL queries with valid table and column names. You can join across tables if multiple are available.",
    value: formatSchemasForAgent(schemas),
  });

  useCopilotAction({
    name: "run_sql_query",
    description:
      "Execute a SQL query against the loaded datasets using DuckDB. Be sure to use DuckDB valid syntax only. Use the dataset schemas to write valid queries with correct table and column names. Returns columns and rows as JSON. Always query data before making claims about it.",
    parameters: [
      {
        name: "sql",
        type: "string" as const,
        description:
          "The SQL query to execute. Use the table name from the dataset schema.",
        required: true,
      },
    ],
    handler: async ({ sql }) => {
      const result = await runQuery(sql);
      return JSON.stringify(result);
    },
    render: ({ status, args, result }) => {
      if (status !== "complete") {
        return <QueryRunningStatus sql={args.sql} />;
      }

      let queryResult: QueryResult;
      try {
        queryResult = typeof result === "string" ? JSON.parse(result) : result;
      } catch {
        return <QueryFallbackStatus />;
      }

      return <QueryResultTable result={queryResult} />;
    },
  });

  useCopilotAction({
    name: "generate_chart",
    description:
      "Generate a chart visualization and add it as a node on the canvas. Provide a valid Vega-Lite v5 JSON spec with the query result data embedded in data.values. Always use run_sql_query first to get the data.",
    parameters: [
      {
        name: "title",
        type: "string" as const,
        description:
          "A concise title for the chart (e.g., 'Churn Rate by Plan Type')",
        required: true,
      },
      {
        name: "chartSpec",
        type: "string" as const,
        description:
          "A valid Vega-Lite v5 JSON spec as a string. Must include data.values with the query result data. Width and height are applied automatically with compact defaults if omitted. Do not set title — it is applied automatically.",
        required: true,
      },
      {
        name: "description",
        type: "string" as const,
        description:
          "A brief description of what the chart shows. Keep it short (~140 chars).",
      },
      {
        name: "sourceQuery",
        type: "string" as const,
        description: "The SQL query used to produce the chart data",
      },
      {
        name: "sourceNodeId",
        type: "string" as const,
        description:
          "ID of an existing node to connect from. The chart will be placed adjacent to it.",
      },
    ],
    handler: async ({
      title,
      chartSpec,
      description,
      sourceQuery,
      sourceNodeId,
    }) => {
      let parsedSpec: Record<string, unknown>;
      try {
        parsedSpec = JSON.parse(chartSpec);
      } catch {
        throw new Error(
          "Invalid Vega-Lite JSON spec. Please provide valid JSON."
        );
      }

      const now = new Date().toISOString();
      const source: NodeSource = "agent";

      const nodeId = addNode(
        {
          variant: "chart" as const,
          title,
          createdAt: now,
          source,
          description,
          sourceQuery,
          chartSpec: parsedSpec,
        },
        sourceNodeId
      );

      return `Created chart "${title}" with id="${nodeId}" on the canvas.`;
    },
    render: ({ status, args }) => {
      if (status !== "complete") {
        return <ChartGeneratingStatus title={args.title} />;
      }
      return <ChartCreatedStatus title={args.title} />;
    },
  });
};

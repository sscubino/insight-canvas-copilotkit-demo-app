"use client";

import {
  ToolCallStatus,
  useAgentContext,
  useFrontendTool,
} from "@copilotkit/react-core/v2";
import { z } from "zod";
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

const runSqlQueryParameters = z.object({
  sql: z
    .string()
    .describe(
      "The SQL query to execute. Use the table name from the dataset schema."
    ),
});

const generateChartParameters = z.object({
  title: z
    .string()
    .describe(
      "A concise title for the chart (e.g., 'Churn Rate by Plan Type')"
    ),
  chartSpec: z
    .string()
    .describe(
      "A valid Vega-Lite v5 JSON spec as a string. Must include data.values with the query result data. Width and height are applied automatically with compact defaults if omitted. Do not set title — it is applied automatically."
    ),
  description: z
    .string()
    .optional()
    .describe(
      "A brief description of what the chart shows. Keep it short (~140 chars)."
    ),
  sourceQuery: z
    .string()
    .optional()
    .describe("The SQL query used to produce the chart data"),
  sourceNodeId: z
    .string()
    .optional()
    .describe(
      "ID of an existing node to connect from. The chart will be placed adjacent to it."
    ),
});

export const useCopilotDataTools = (schemas: DatasetSchema[]) => {
  const { runQuery } = useDuckDB();
  const { addNode } = useWorkspaceState();

  const schemaContextText = formatSchemasForAgent(schemas);

  useAgentContext({
    description:
      "The dataset schemas currently loaded in DuckDB. Use these to write correct SQL queries with valid table and column names. You can join across tables if multiple are available.",
    value: schemaContextText,
  });

  useFrontendTool(
    {
      name: "run_sql_query",
      description:
        "Execute a SQL query against the loaded datasets using DuckDB. Be sure to use DuckDB valid syntax only. Use the dataset schemas to write valid queries with correct table and column names. Returns columns and rows as JSON. Always query data before making claims about it.",
      parameters: runSqlQueryParameters,
      handler: async ({ sql }) => {
        const result = await runQuery(sql);
        return JSON.stringify(result);
      },
      render: (props) => {
        if (props.status !== ToolCallStatus.Complete) {
          return <QueryRunningStatus sql={props.args.sql} />;
        }

        let queryResult: QueryResult;
        try {
          queryResult = JSON.parse(props.result);
        } catch {
          return <QueryFallbackStatus />;
        }

        return <QueryResultTable result={queryResult} />;
      },
    },
    [runQuery]
  );

  useFrontendTool(
    {
      name: "generate_chart",
      description:
        "Generate a chart visualization and add it as a node on the canvas. Provide a valid Vega-Lite v5 JSON spec with the query result data embedded in data.values. Always use run_sql_query first to get the data.",
      parameters: generateChartParameters,
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
      render: (props) => {
        if (props.status !== ToolCallStatus.Complete) {
          return <ChartGeneratingStatus title={props.args.title} />;
        }
        return <ChartCreatedStatus title={props.args.title} />;
      },
    },
    [addNode]
  );
};

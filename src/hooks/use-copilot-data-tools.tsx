"use client";

import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import { useDuckDB } from "@/contexts/duckdb-context";
import { useCanvasState } from "@/contexts/canvas-state-context";
import type { DatasetSchema, QueryResult } from "@/types/duckdb";
import type { NodeSource } from "@/types/canvas";

const formatSchemaForAgent = (schema: DatasetSchema | null): string => {
  if (!schema) return "No dataset loaded yet.";

  const columnsDesc = schema.columns
    .map((col) => `  - ${col.name} (${col.type})`)
    .join("\n");

  return `Table "${schema.tableName}" (${schema.rowCount} rows):\n${columnsDesc}`;
};

const QueryRunningIndicator = ({ sql }: { sql?: string }) => (
  <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-hover px-3 py-2 font-mono text-xs text-muted">
    <div
      className="h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-dim border-t-transparent"
      role="status"
      aria-label="Query running"
    />
    <span className="truncate">
      {sql ? `Running: ${sql.slice(0, 60)}…` : "Running query…"}
    </span>
  </div>
);

const QueryResultTable = ({ result }: { result: QueryResult }) => {
  const displayRows = result.rows.slice(0, 8);

  return (
    <div className="overflow-hidden rounded-lg border border-border text-xs">
      <div className="bg-surface-hover px-3 py-1.5 font-mono text-[10px] text-dim">
        {result.rowCount} row{result.rowCount !== 1 ? "s" : ""} &middot;{" "}
        {result.columns.length} col
        {result.columns.length !== 1 ? "s" : ""}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full bg-surface-50" aria-label="Query results">
          <thead>
            <tr className="border-b border-border bg-surface-hover">
              {result.columns.map((col) => (
                <th
                  key={col}
                  scope="col"
                  className="whitespace-nowrap px-2 py-1 text-left font-mono text-[10px] font-medium text-muted"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row, rowIdx) => (
              <tr
                key={`row-${result.columns.map((c) => row[c]).join("-")}-${rowIdx}`}
                className="border-b border-border last:border-b-0"
              >
                {result.columns.map((col) => (
                  <td
                    key={`${rowIdx}-${col}`}
                    className="whitespace-nowrap px-2 py-1 font-mono text-muted"
                  >
                    {String(row[col] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {result.rowCount > 8 && (
        <div className="bg-surface-hover px-3 py-1 text-center font-mono text-[9px] text-dim">
          Showing 8 of {result.rowCount} rows
        </div>
      )}
    </div>
  );
};

const ChartGeneratingIndicator = ({ title }: { title?: string }) => (
  <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-hover px-3 py-2 text-xs text-muted">
    <div
      className="h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-dim border-t-transparent"
      role="status"
      aria-label="Generating chart"
    />
    <span>{title ? `Generating chart: ${title}…` : "Generating chart…"}</span>
  </div>
);

const ChartCreatedIndicator = ({ title }: { title?: string }) => (
  <div className="flex items-center gap-2 rounded-lg border border-mint-light bg-mint-light/10 px-3 py-2 text-xs text-mint">
    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-mint text-[10px] font-bold text-invert">
      ✓
    </span>
    <span>Chart{title ? ` "${title}"` : ""} added to canvas</span>
  </div>
);

export const useCopilotDataTools = (schema: DatasetSchema | null) => {
  const { runQuery } = useDuckDB();
  const { addNode } = useCanvasState();

  useCopilotReadable({
    description:
      "The dataset schema currently loaded in DuckDB. Use this to write correct SQL queries with valid table and column names.",
    value: formatSchemaForAgent(schema),
  });

  useCopilotAction({
    name: "run_sql_query",
    description:
      "Execute a SQL query against the loaded dataset using DuckDB. Be sure to use DuckDB valid syntax only. Use the dataset schema to write valid queries. Returns columns and rows as JSON. Always query data before making claims about it.",
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
        return <QueryRunningIndicator sql={args.sql} />;
      }

      let queryResult: QueryResult;
      try {
        queryResult = typeof result === "string" ? JSON.parse(result) : result;
      } catch {
        return (
          <div className="rounded-lg border border-border bg-surface-hover px-3 py-2 text-xs text-muted">
            Query completed
          </div>
        );
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
        return <ChartGeneratingIndicator title={args.title} />;
      }
      return <ChartCreatedIndicator title={args.title} />;
    },
  });
};

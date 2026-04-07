import { ActionStatus } from "@/components/chat/action-status";
import type { QueryResult } from "@/types/duckdb";

const MAX_PREVIEW_ROWS = 8;

const QueryRunningStatus = ({ sql }: { sql?: string }) => (
  <ActionStatus variant="loading">
    {sql ? `Running: ${sql.slice(0, 60)}…` : "Running query…"}
  </ActionStatus>
);

const QueryFallbackStatus = () => <ActionStatus>Query completed</ActionStatus>;

const QueryResultTable = ({ result }: { result: QueryResult }) => {
  const displayRows = result.rows.slice(0, MAX_PREVIEW_ROWS);
  const hasMore = result.rowCount > MAX_PREVIEW_ROWS;

  const pluralize = (count: number, singular: string) =>
    `${count} ${singular}${count !== 1 ? "s" : ""}`;

  return (
    <div className="overflow-hidden rounded-lg border border-border text-xs">
      <div className="bg-surface-hover px-3 py-1.5 font-mono text-[10px] text-dim">
        {pluralize(result.rowCount, "row")} &middot;{" "}
        {pluralize(result.columns.length, "col")}
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

      {hasMore && (
        <div className="bg-surface-hover px-3 py-1 text-center font-mono text-[9px] text-dim">
          Showing {MAX_PREVIEW_ROWS} of {result.rowCount} rows
        </div>
      )}
    </div>
  );
};

const QueryErrorStatus = ({ error }: { error: string }) => (
  <ActionStatus variant="error">Query failed: {error}</ActionStatus>
);

const ChartGeneratingStatus = ({ title }: { title?: string }) => (
  <ActionStatus variant="loading">
    {title ? `Generating chart: ${title}…` : "Generating chart…"}
  </ActionStatus>
);

const ChartCreatedStatus = ({ title }: { title?: string }) => (
  <ActionStatus variant="success">
    Chart{title ? ` "${title}"` : ""} added to canvas
  </ActionStatus>
);

export {
  QueryRunningStatus,
  QueryFallbackStatus,
  QueryResultTable,
  QueryErrorStatus,
  ChartGeneratingStatus,
  ChartCreatedStatus,
};

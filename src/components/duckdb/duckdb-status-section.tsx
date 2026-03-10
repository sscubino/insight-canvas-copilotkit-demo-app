"use client";

import { DuckDBStatus } from "@/lib/duckdb/types";
import { useDuckDB } from "@/lib/duckdb/use-duckdb";

const STATUS_LABELS: Record<DuckDBStatus, string> = {
  idle: "Idle",
  initializing: "Initializing DuckDB...",
  ready: "Ready",
  error: "Error",
};

const STATUS_COLORS: Record<DuckDBStatus, string> = {
  idle: "bg-dim",
  initializing: "bg-warning",
  ready: "bg-success",
  error: "bg-destructive",
};

const DuckDBStatusSection = () => {
  const { status, error } = useDuckDB();

  return (
    <section
      className="rounded-xl border border-border bg-surface p-5"
      aria-label="DuckDB status"
    >
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
        DuckDB Status
      </h2>
      <div className="flex items-center gap-2">
        <span
          className={`inline-block h-2.5 w-2.5 rounded-full ${STATUS_COLORS[status]}`}
          aria-hidden="true"
        />
        <span className="text-sm font-medium text-foreground">
          {STATUS_LABELS[status]}
        </span>
      </div>
      {error && (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </section>
  );
};

export { DuckDBStatusSection };

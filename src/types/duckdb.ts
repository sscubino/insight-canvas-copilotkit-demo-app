import type { AsyncDuckDB, AsyncDuckDBConnection } from "@duckdb/duckdb-wasm";

export type ColumnSchema = {
  name: string;
  type: string;
};

export type DatasetSchema = {
  tableName: string;
  columns: ColumnSchema[];
  rowCount: number;
};

export type QueryResult = {
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
};

export type DuckDBStatus = "idle" | "initializing" | "ready" | "error";

export type DuckDBContextValue = {
  status: DuckDBStatus;
  db: AsyncDuckDB | null;
  connection: AsyncDuckDBConnection | null;
  error: string | null;
  runQuery: (sql: string) => Promise<QueryResult>;
  loadCSV: (tableName: string, csvContent: string) => Promise<DatasetSchema>;
};

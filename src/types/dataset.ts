import type { DatasetSchema } from "@/types/duckdb";

export type DatasetSource = "sample" | "user";

export type DatasetFormat = "csv" | "json";

export type DatasetInfo = {
  id: string;
  name: string;
  fileName: string;
  tableName: string;
  source: DatasetSource;
  format: DatasetFormat;
  schema: DatasetSchema | null;
  isLoaded: boolean;
  isSelected: boolean;
  emoji?: string;
  rowCount?: number;
  columnCount?: number;
};

export type DatasetMeta = Omit<
  DatasetInfo,
  "schema" | "isLoaded" | "isSelected"
>;

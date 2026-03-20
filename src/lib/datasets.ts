import { SAMPLE_DATASETS } from "@/constants/sample-datasets";
import { DatasetFormat, DatasetInfo, DatasetMeta } from "@/types/dataset";
import { getDatasetContent as getStoredDatasetContent } from "./dataset-storage";
import { DatasetSchema } from "@/types/duckdb";

export const detectFormat = (fileName: string): DatasetFormat | null => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (ext === "csv") return "csv";
  if (ext === "json" || ext === "jsonl" || ext === "ndjson") return "json";
  return null;
};

export const buildSampleDatasetsInfo = (): DatasetInfo[] =>
  SAMPLE_DATASETS.map((s) => ({
    id: s.id,
    name: s.name,
    fileName: s.fileName,
    tableName: s.tableName,
    source: "sample" as const,
    format: "csv" as const,
    schema: null,
    isLoaded: false,
    isSelected: false,
    emoji: s.emoji,
    rowCount: s.rows,
    columnCount: s.cols,
  }));

const fetchSampleDatasetContent = async (
  dataset: DatasetInfo
): Promise<string> => {
  const sample = SAMPLE_DATASETS.find((s) => s.id === dataset.id);
  if (!sample) throw new Error(`Sample dataset "${dataset.id}" not found`);
  const response = await fetch(sample.filePath);
  if (!response.ok)
    throw new Error(
      `Failed to fetch ${sample.filePath}: ${response.statusText}`
    );
  return response.text();
};

export const getDatasetContent = async (
  dataset: DatasetInfo
): Promise<string> => {
  if (dataset.source === "sample") {
    return fetchSampleDatasetContent(dataset);
  }
  const stored = await getStoredDatasetContent(dataset.id);
  if (!stored) throw new Error(`No stored content for "${dataset.id}"`);
  return stored;
};

export const markDatasetAsLoaded = (
  dataset: DatasetInfo,
  schema: DatasetSchema
): DatasetInfo => {
  return {
    ...dataset,
    schema,
    isLoaded: true,
    rowCount: schema.rowCount,
    columnCount: schema.columns.length,
  };
};

export const getDatasetMetaFromUploadedFile = (
  file: File,
  format: DatasetFormat
): DatasetMeta => {
  const formatedName = file.name.replace(/\.[^.]+$/, "").replace(/[_-]/g, " ");
  return {
    id: `user-${Date.now()}-${formatedName.toLowerCase()}`,
    name: formatedName,
    fileName: file.name,
    tableName: formatedName.toLowerCase(),
    source: "user",
    format,
  };
};

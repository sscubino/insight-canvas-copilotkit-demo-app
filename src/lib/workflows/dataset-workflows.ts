"use client";

import { useCallback, useMemo } from "react";
import { useDuckDB } from "@/contexts/duckdb-context";
import {
  getStoredDatasets,
  removeStoredDataset,
  storeDataset,
} from "@/lib/dataset-storage";
import {
  buildSampleDatasetsInfo,
  detectFormat,
  getDatasetContent,
  getDatasetMetaFromUploadedFile,
  markDatasetAsLoaded,
} from "@/lib/datasets";
import type { DatasetInfo } from "@/types/dataset";
import type { DatasetSchema } from "@/types/duckdb";
import { useAppStore } from "@/state/store";

export type DuckDBLoaders = {
  loadCSV: (tableName: string, content: string) => Promise<DatasetSchema>;
  loadJSON: (tableName: string, content: string) => Promise<DatasetSchema>;
};

const loadingDatasetIds = new Set<string>();

const loadDatasetIntoDuckDB = (
  dataset: DatasetInfo,
  content: string,
  loaders: DuckDBLoaders
) => {
  return dataset.format === "json"
    ? loaders.loadJSON(dataset.tableName, content)
    : loaders.loadCSV(dataset.tableName, content);
};

export const ensureDatasetLoaded = async (
  datasetId: string,
  loaders: DuckDBLoaders
) => {
  const dataset = useAppStore
    .getState()
    .datasets.find((item) => item.id === datasetId);

  if (!dataset || dataset.isLoaded) return;
  if (loadingDatasetIds.has(dataset.id)) return;
  loadingDatasetIds.add(dataset.id);

  try {
    const content = await getDatasetContent(dataset);
    const schema = await loadDatasetIntoDuckDB(dataset, content, loaders);
    useAppStore
      .getState()
      .upsertDataset(markDatasetAsLoaded(dataset, schema));
  } catch (error) {
    console.error(`Failed to load dataset "${dataset.id}":`, error);
  } finally {
    loadingDatasetIds.delete(dataset.id);
  }
};

export const initializeDatasets = async () => {
  useAppStore.getState().setDatasets(buildSampleDatasetsInfo());
  const stored = await getStoredDatasets();
  const userDatasets: DatasetInfo[] = stored.map((meta) => ({
    ...meta,
    schema: null,
    isSelected: false,
    isLoaded: false,
  }));
  useAppStore.getState().appendDatasets(userDatasets);
};

export const useDatasetWorkflows = () => {
  const { status: duckDBStatus, loadCSV, loadJSON } = useDuckDB();
  const isDuckDBReady = duckDBStatus === "ready";
  const loaders = useMemo(() => ({ loadCSV, loadJSON }), [loadCSV, loadJSON]);

  const addUserFile = useCallback(
    async (file: File) => {
      const format = detectFormat(file.name);
      if (!format) throw new Error(`Unsupported file format: ${file.name}`);

      const content = await file.text();
      const meta = getDatasetMetaFromUploadedFile(file, format);
      const dataset: DatasetInfo = {
        ...meta,
        schema: null,
        isLoaded: false,
        isSelected: true,
      };

      await storeDataset(meta, content);
      useAppStore.getState().upsertDataset(dataset);

      if (!isDuckDBReady) return;

      try {
        const schema = await loadDatasetIntoDuckDB(dataset, content, loaders);
        useAppStore
          .getState()
          .upsertDataset(markDatasetAsLoaded(dataset, schema));
      } catch (error) {
        console.error(`Failed to load user file "${file.name}":`, error);
      }
    },
    [isDuckDBReady, loaders]
  );

  const removeDataset = useCallback(async (id: string) => {
    const dataset = useAppStore
      .getState()
      .datasets.find((item) => item.id === id);
    if (!dataset || dataset.source === "sample") return;

    await removeStoredDataset(id);
    useAppStore.getState().removeDatasetById(id);
  }, []);

  const toggleSelection = useCallback(
    (id: string) => {
      useAppStore.getState().toggleDatasetSelection(id);

      const dataset = useAppStore
        .getState()
        .datasets.find((item) => item.id === id);
      if (dataset?.isSelected && !dataset.isLoaded) {
        void ensureDatasetLoaded(dataset.id, loaders);
      }
    },
    [loaders]
  );

  const setSelectedDatasetIds = useCallback(
    (datasetIds: string[]) => {
      useAppStore.getState().setSelectedDatasetIds(datasetIds);
      const selectedSet = new Set(datasetIds);

      const datasets = useAppStore.getState().datasets;
      datasets.forEach((dataset) => {
        if (selectedSet.has(dataset.id) && !dataset.isLoaded) {
          void ensureDatasetLoaded(dataset.id, loaders);
        }
      });
    },
    [loaders]
  );

  return {
    addUserFile,
    removeDataset,
    toggleSelection,
    setSelectedDatasetIds,
  };
};

"use client";

import { useCallback, useEffect } from "react";
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
import { useAppStore } from "@/state/store";

const loadingDatasetIds = new Set<string>();

export const useDatasetWorkflows = () => {
  const { status: duckDBStatus, loadCSV, loadJSON } = useDuckDB();
  const isDuckDBReady = duckDBStatus === "ready";

  const isDatasetsInitialized = useAppStore(
    (state) => state.isDatasetsInitialized
  );

  const loadDatasetIntoDuckDB = useCallback(
    async (dataset: DatasetInfo, content: string) => {
      return dataset.format === "json"
        ? loadJSON(dataset.tableName, content)
        : loadCSV(dataset.tableName, content);
    },
    [loadCSV, loadJSON]
  );

  const ensureLoaded = useCallback(
    async (datasetId: string) => {
      const dataset = useAppStore
        .getState()
        .datasets.find((item) => item.id === datasetId);

      if (!dataset || dataset.isLoaded || !isDuckDBReady) return;
      if (loadingDatasetIds.has(dataset.id)) return;
      loadingDatasetIds.add(dataset.id);

      try {
        const content = await getDatasetContent(dataset);
        const schema = await loadDatasetIntoDuckDB(dataset, content);
        useAppStore.getState().upsertDataset(markDatasetAsLoaded(dataset, schema));
      } catch (error) {
        console.error(`Failed to load dataset "${dataset.id}":`, error);
      } finally {
        loadingDatasetIds.delete(dataset.id);
      }
    },
    [isDuckDBReady, loadDatasetIntoDuckDB]
  );

  const initializeDatasets = useCallback(async () => {
    if (useAppStore.getState().isDatasetsInitialized) return;

    useAppStore.getState().setIsDatasetsInitialized(true);
    useAppStore.getState().setDatasets(buildSampleDatasetsInfo());

    const stored = await getStoredDatasets();
    const userDatasets: DatasetInfo[] = stored.map((meta) => ({
      ...meta,
      schema: null,
      isSelected: false,
      isLoaded: false,
    }));
    useAppStore.getState().appendDatasets(userDatasets);
  }, []);

  useEffect(() => {
    if (!isDuckDBReady || !isDatasetsInitialized) return;

    const pendingSelected = useAppStore
      .getState()
      .datasets.filter((dataset) => dataset.isSelected && !dataset.isLoaded);
    if (pendingSelected.length === 0) return;

    pendingSelected.forEach((dataset) => {
      void ensureLoaded(dataset.id);
    });
  }, [isDuckDBReady, isDatasetsInitialized, ensureLoaded]);

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
        const schema = await loadDatasetIntoDuckDB(dataset, content);
        useAppStore.getState().upsertDataset(markDatasetAsLoaded(dataset, schema));
      } catch (error) {
        console.error(`Failed to load user file "${file.name}":`, error);
      }
    },
    [isDuckDBReady, loadDatasetIntoDuckDB]
  );

  const removeDataset = useCallback(
    async (id: string) => {
      const dataset = useAppStore
        .getState()
        .datasets.find((item) => item.id === id);
      if (!dataset || dataset.source === "sample") return;

      await removeStoredDataset(id);
      useAppStore.getState().removeDatasetById(id);
    },
    []
  );

  const toggleSelection = useCallback(
    (id: string) => {
      useAppStore.getState().toggleDatasetSelection(id);

      const dataset = useAppStore
        .getState()
        .datasets.find((item) => item.id === id);
      if (dataset?.isSelected && !dataset.isLoaded) {
        void ensureLoaded(dataset.id);
      }
    },
    [ensureLoaded]
  );

  const setSelectedDatasetIds = useCallback(
    (datasetIds: string[]) => {
      useAppStore.getState().setSelectedDatasetIds(datasetIds);
      const selectedSet = new Set(datasetIds);

      const datasets = useAppStore.getState().datasets;
      datasets.forEach((dataset) => {
        if (selectedSet.has(dataset.id) && !dataset.isLoaded) {
          void ensureLoaded(dataset.id);
        }
      });
    },
    [ensureLoaded]
  );

  return {
    initializeDatasets,
    addUserFile,
    removeDataset,
    toggleSelection,
    setSelectedDatasetIds,
  };
};

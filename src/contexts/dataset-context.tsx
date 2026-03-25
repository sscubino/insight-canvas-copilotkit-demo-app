"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useDuckDB } from "@/contexts/duckdb-context";
import {
  getStoredDatasets,
  storeDataset,
  getDatasetContent,
  removeStoredDataset,
} from "@/lib/dataset-storage";
import { SAMPLE_DATASETS } from "@/constants/sample-datasets";
import type { DatasetInfo, DatasetFormat, DatasetMeta } from "@/types/dataset";
import type { DatasetSchema } from "@/types/duckdb";

type DatasetContextValue = {
  datasets: DatasetInfo[];
  selectedDatasets: DatasetInfo[];
  activeSchemas: DatasetSchema[];
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  addUserFile: (file: File) => Promise<void>;
  removeDataset: (id: string) => void;
  toggleSelection: (id: string) => void;
};

const DatasetContext = createContext<DatasetContextValue | null>(null);

const detectFormat = (fileName: string): DatasetFormat | null => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (ext === "csv") return "csv";
  if (ext === "json" || ext === "jsonl" || ext === "ndjson") return "json";
  return null;
};

const toTableName = (fileName: string): string =>
  fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9_]/g, "_")
    .toLowerCase();

const buildSampleDatasets = (): DatasetInfo[] =>
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

const DatasetProvider = ({ children }: { children: ReactNode }) => {
  const { status: duckDBStatus, loadCSV, loadJSON } = useDuckDB();
  const isDuckDBReady = duckDBStatus === "ready";

  const [datasets, setDatasets] = useState<DatasetInfo[]>(buildSampleDatasets);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const initializedRef = useRef(false);
  const loadingRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const restoreUserDatasets = async () => {
      const stored = await getStoredDatasets();
      if (stored.length === 0) {
        setIsDrawerOpen(true);
        return;
      }

      const userDatasets: DatasetInfo[] = stored.map((meta) => ({
        ...meta,
        schema: null,
        isSelected: false,
        isLoaded: false,
      }));

      setDatasets((prev) => [...prev, ...userDatasets]);
      setIsDrawerOpen(true);
    };

    restoreUserDatasets();
  }, []);

  const loadDatasetIntoDuckDB = useCallback(
    async (dataset: DatasetInfo, content: string): Promise<DatasetSchema> => {
      if (dataset.format === "json") {
        return loadJSON(dataset.tableName, content);
      }
      return loadCSV(dataset.tableName, content);
    },
    [loadCSV, loadJSON]
  );

  const fetchSampleContent = useCallback(
    async (dataset: DatasetInfo): Promise<string> => {
      const sample = SAMPLE_DATASETS.find((s) => s.id === dataset.id);
      if (!sample) throw new Error(`Sample dataset "${dataset.id}" not found`);
      const response = await fetch(sample.filePath);
      if (!response.ok)
        throw new Error(
          `Failed to fetch ${sample.filePath}: ${response.statusText}`
        );
      return response.text();
    },
    []
  );

  const ensureLoaded = useCallback(
    async (dataset: DatasetInfo) => {
      if (dataset.isLoaded || !isDuckDBReady) return;
      if (loadingRef.current.has(dataset.id)) return;
      loadingRef.current.add(dataset.id);

      try {
        let content: string;
        if (dataset.source === "sample") {
          content = await fetchSampleContent(dataset);
        } else {
          const stored = await getDatasetContent(dataset.id);
          if (!stored) throw new Error(`No stored content for "${dataset.id}"`);
          content = stored;
        }

        const schema = await loadDatasetIntoDuckDB(dataset, content);

        setDatasets((prev) =>
          prev.map((d) =>
            d.id === dataset.id
              ? {
                  ...d,
                  schema,
                  isLoaded: true,
                  rowCount: schema.rowCount,
                  columnCount: schema.columns.length,
                }
              : d
          )
        );
      } catch (err) {
        console.error(`Failed to load dataset "${dataset.id}":`, err);
      } finally {
        loadingRef.current.delete(dataset.id);
      }
    },
    [isDuckDBReady, fetchSampleContent, loadDatasetIntoDuckDB]
  );

  const toggleSelection = useCallback(
    (id: string) => {
      setDatasets((prev) => {
        const dataset = prev.find((d) => d.id === id);
        if (!dataset) return prev;

        const willBeSelected = !dataset.isSelected;

        if (willBeSelected && !dataset.isLoaded) {
          ensureLoaded(dataset);
        }

        const updated = prev.map((d) =>
          d.id === id ? { ...d, isSelected: willBeSelected } : d
        );

        return updated;
      });
    },
    [ensureLoaded]
  );

  const addUserFile = useCallback(
    async (file: File) => {
      const format = detectFormat(file.name);
      if (!format) throw new Error(`Unsupported file format: ${file.name}`);

      const content = await file.text();
      const id = `user-${Date.now()}-${file.name}`;
      const tableName = toTableName(file.name);
      const name = file.name.replace(/\.[^.]+$/, "").replace(/[_-]/g, " ");

      const newDataset: DatasetInfo = {
        id,
        name,
        fileName: file.name,
        tableName,
        source: "user",
        format,
        schema: null,
        isLoaded: false,
        isSelected: true,
      };

      const meta: DatasetMeta = {
        id,
        name,
        fileName: file.name,
        tableName,
        source: "user",
        format,
      };
      await storeDataset(meta, content);

      setDatasets((prev) => [...prev, newDataset]);

      if (isDuckDBReady) {
        try {
          const schema =
            format === "json"
              ? await loadJSON(tableName, content)
              : await loadCSV(tableName, content);

          setDatasets((prev) =>
            prev.map((d) =>
              d.id === id
                ? {
                    ...d,
                    schema,
                    isLoaded: true,
                    rowCount: schema.rowCount,
                    columnCount: schema.columns.length,
                  }
                : d
            )
          );
        } catch (err) {
          console.error(`Failed to load user file "${file.name}":`, err);
        }
      }
    },
    [isDuckDBReady, loadCSV, loadJSON]
  );

  const removeDataset = useCallback((id: string) => {
    setDatasets((prev) => {
      const dataset = prev.find((d) => d.id === id);
      if (!dataset || dataset.source === "sample") return prev;
      removeStoredDataset(id);
      return prev.filter((d) => d.id !== id);
    });
  }, []);

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setIsDrawerOpen((prev) => !prev), []);

  const selectedDatasets = useMemo(
    () => datasets.filter((d) => d.isSelected),
    [datasets]
  );

  const activeSchemas = useMemo(
    () =>
      selectedDatasets
        .filter((d) => d.isLoaded && d.schema)
        .map((d) => d.schema!),
    [selectedDatasets]
  );

  const contextValue = useMemo<DatasetContextValue>(
    () => ({
      datasets,
      selectedDatasets,
      activeSchemas,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      toggleDrawer,
      addUserFile,
      removeDataset,
      toggleSelection,
    }),
    [
      datasets,
      selectedDatasets,
      activeSchemas,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      toggleDrawer,
      addUserFile,
      removeDataset,
      toggleSelection,
    ]
  );

  return (
    <DatasetContext.Provider value={contextValue}>
      {children}
    </DatasetContext.Provider>
  );
};

const useDatasets = (): DatasetContextValue => {
  const context = useContext(DatasetContext);
  if (!context) {
    throw new Error("useDatasets must be used within a <DatasetProvider>");
  }
  return context;
};

export { DatasetProvider, useDatasets };

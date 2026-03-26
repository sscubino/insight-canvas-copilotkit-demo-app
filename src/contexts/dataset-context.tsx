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
  removeStoredDataset,
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

const DatasetProvider = ({ children }: { children: ReactNode }) => {
  const { status: duckDBStatus, loadCSV, loadJSON } = useDuckDB();
  const isDuckDBReady = duckDBStatus === "ready";

  const [datasets, setDatasets] = useState<DatasetInfo[]>(
    buildSampleDatasetsInfo
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const initializedRef = useRef(false);
  const loadingRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const restoreUserDatasets = async () => {
      const stored = await getStoredDatasets();

      const userDatasets: DatasetInfo[] = stored.map((meta) => ({
        ...meta,
        schema: null,
        isSelected: false,
        isLoaded: false,
      }));

      setIsDrawerOpen(true);
      setDatasets((prev) => [...prev, ...userDatasets]);
    };

    restoreUserDatasets();
  }, []);

  const loadDatasetIntoDuckDB = useCallback(
    async (dataset: DatasetInfo, content: string) => {
      const { format, tableName } = dataset;
      return format === "json"
        ? loadJSON(tableName, content)
        : loadCSV(tableName, content);
    },
    [loadCSV, loadJSON]
  );

  const ensureLoaded = useCallback(
    async (dataset: DatasetInfo) => {
      if (dataset.isLoaded || !isDuckDBReady) return;
      if (loadingRef.current.has(dataset.id)) return;
      loadingRef.current.add(dataset.id);

      try {
        const content = await getDatasetContent(dataset);
        const schema = await loadDatasetIntoDuckDB(dataset, content);

        setDatasets((prev) =>
          prev.map((d) =>
            d.id === dataset.id ? markDatasetAsLoaded(d, schema) : d
          )
        );
      } catch (err) {
        console.error(`Failed to load dataset "${dataset.id}":`, err);
      } finally {
        loadingRef.current.delete(dataset.id);
      }
    },
    [isDuckDBReady, loadDatasetIntoDuckDB]
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

      const meta = getDatasetMetaFromUploadedFile(file, format);
      const newDataset: DatasetInfo = {
        ...meta,
        schema: null,
        isLoaded: false,
        isSelected: true,
      };

      await storeDataset(meta, content);

      setDatasets((prev) => [...prev, newDataset]);

      if (isDuckDBReady) {
        try {
          const schema = await loadDatasetIntoDuckDB(newDataset, content);

          setDatasets((prev) =>
            prev.map((d) =>
              d.id === meta.id ? markDatasetAsLoaded(d, schema) : d
            )
          );
        } catch (err) {
          console.error(`Failed to load user file "${file.name}":`, err);
        }
      }
    },
    [isDuckDBReady, loadDatasetIntoDuckDB]
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

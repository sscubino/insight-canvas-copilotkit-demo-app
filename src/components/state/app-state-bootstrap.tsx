"use client";

import { useEffect } from "react";
import { useDuckDB } from "@/contexts/duckdb-context";
import {
  initializeDatasets,
  ensureDatasetLoaded,
} from "@/lib/workflows/dataset-workflows";
import { restoreSessionState } from "@/lib/workflows/session-workflows";
import { useAppStore } from "@/state/store";

export const AppStateBootstrap = () => {
  const { status: duckDBStatus, loadCSV, loadJSON } = useDuckDB();
  const isDuckDBReady = duckDBStatus === "ready";

  const isInitialized = useAppStore((state) => state.isInitialized);
  const setIsInitialized = useAppStore((state) => state.setIsInitialized);

  const isDatasetsInitialized = useAppStore(
    (state) => state.isDatasetsInitialized
  );
  const setIsDatasetsInitialized = useAppStore(
    (state) => state.setIsDatasetsInitialized
  );

  useEffect(() => {
    if (isInitialized) return;

    void restoreSessionState().catch(() => {
      setIsInitialized(true);
    });
  }, [isInitialized, setIsInitialized]);

  useEffect(() => {
    if (isDatasetsInitialized) return;

    void initializeDatasets().catch(() => {
      setIsDatasetsInitialized(true);
    });
  }, [isDatasetsInitialized, setIsDatasetsInitialized]);

  useEffect(() => {
    if (!isDuckDBReady || !isDatasetsInitialized) return;

    const pending = useAppStore
      .getState()
      .datasets.filter((d) => d.isSelected && !d.isLoaded);
    if (pending.length === 0) return;

    const loaders = { loadCSV, loadJSON };
    pending.forEach((d) => {
      void ensureDatasetLoaded(d.id, loaders);
    });
  }, [isDuckDBReady, isDatasetsInitialized, loadCSV, loadJSON]);

  return null;
};

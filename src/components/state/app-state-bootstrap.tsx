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
  const { status: duckDBStatus, loaders } = useDuckDB();
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

    void restoreSessionState().finally(() => {
      setIsInitialized(true);
    });
  }, [isInitialized, setIsInitialized]);

  useEffect(() => {
    if (isDatasetsInitialized) return;

    void initializeDatasets().finally(() => {
      setIsDatasetsInitialized(true);
    });
  }, [isDatasetsInitialized, setIsDatasetsInitialized]);

  useEffect(() => {
    if (!isDuckDBReady || !isDatasetsInitialized) return;

    const pending = useAppStore
      .getState()
      .datasets.filter((dataset) => dataset.isSelected && !dataset.isLoaded);
    if (pending.length === 0) return;

    pending.forEach((dataset) => {
      void ensureDatasetLoaded(dataset.id, loaders);
    });
  }, [isDuckDBReady, isDatasetsInitialized, loaders]);

  return null;
};

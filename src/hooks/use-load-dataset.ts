"use client";

import { useEffect, useRef, useState } from "react";
import { useDuckDB } from "@/contexts/duckdb-context";
import type { DatasetSchema } from "@/types/duckdb";

type DatasetConfig = {
  filePath: string;
  tableName: string;
};

type LoadDatasetStatus =
  | "idle"
  | "fetching"
  | "fetched"
  | "loading"
  | "loaded"
  | "error";

type LoadDatasetResult = {
  schema: DatasetSchema | null;
  status: LoadDatasetStatus;
  isPending: boolean;
  isLoaded: boolean;
  isError: boolean;
  error: string | null;
};

export const useLoadDataset = ({
  filePath,
  tableName,
}: DatasetConfig): LoadDatasetResult => {
  const { status: duckDBStatus, loadCSV } = useDuckDB();
  const isDuckDBReady = duckDBStatus === "ready";

  const [status, setStatus] = useState<LoadDatasetStatus>("idle");
  const [schema, setSchema] = useState<DatasetSchema | null>(null);
  const [error, setError] = useState<string | null>(null);

  const csvTextRef = useRef<string | null>(null);
  const [csvReady, setCsvReady] = useState(false);
  const loadedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const fetchCSV = async () => {
      setStatus("fetching");
      try {
        const response = await fetch(filePath);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch ${filePath}: ${response.statusText}`
          );
        }
        const text = await response.text();
        if (!cancelled) {
          csvTextRef.current = text;
          setStatus("loaded");
          setCsvReady(true);
        }
      } catch (err) {
        if (!cancelled) {
          setStatus("error");
          setError(
            err instanceof Error ? err.message : `Failed to fetch ${filePath}`
          );
        }
      }
    };

    fetchCSV();
    return () => {
      cancelled = true;
    };
  }, [filePath]);

  useEffect(() => {
    if (!isDuckDBReady || !csvReady || loadedRef.current) return;

    let cancelled = false;

    const load = async () => {
      setStatus("loading");
      setError(null);

      try {
        const datasetSchema = await loadCSV(tableName, csvTextRef.current!);
        if (!cancelled) {
          setSchema(datasetSchema);
          setStatus("loaded");
          loadedRef.current = true;
          csvTextRef.current = null;
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : `Failed to load dataset "${tableName}"`
          );
          setStatus("error");
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [isDuckDBReady, csvReady, tableName, loadCSV]);

  return {
    schema,
    status,
    isPending: status !== "loaded" && status !== "error",
    isLoaded: status === "loaded",
    isError: status === "error",
    error,
  };
};

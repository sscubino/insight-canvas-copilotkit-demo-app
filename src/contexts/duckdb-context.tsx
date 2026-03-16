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
import type { AsyncDuckDB, AsyncDuckDBConnection } from "@duckdb/duckdb-wasm";
import type {
  DuckDBContextValue,
  DuckDBStatus,
  QueryResult,
  DatasetSchema,
} from "@/types/duckdb";
import {
  initDuckDB,
  runQuery as runDuckDBQuery,
  loadCSV as loadDuckDBCSV,
} from "@/lib/duckdb";

const DuckDBContext = createContext<DuckDBContextValue | null>(null);

const DuckDBProvider = ({ children }: { children: ReactNode }) => {
  const [status, setStatus] = useState<DuckDBStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const dbRef = useRef<AsyncDuckDB | null>(null);
  const connRef = useRef<AsyncDuckDBConnection | null>(null);

  useEffect(() => {
    let cancelled = false;

    const initialize = async () => {
      setStatus("initializing");
      setError(null);

      try {
        const db = await initDuckDB();

        if (cancelled) {
          await db.terminate();
          return;
        }

        const conn = await db.connect();
        dbRef.current = db;
        connRef.current = conn;

        if (cancelled) {
          await conn.close();
          await db.terminate();
          return;
        }

        setStatus("ready");
      } catch (err) {
        if (cancelled) return;

        const message =
          err instanceof Error ? err.message : "Failed to initialize DuckDB";
        setError(message);
        setStatus("error");
      }
    };

    initialize();

    return () => {
      cancelled = true;

      const cleanup = async () => {
        if (connRef.current) {
          await connRef.current.close();
          connRef.current = null;
        }
        if (dbRef.current) {
          await dbRef.current.terminate();
          dbRef.current = null;
        }
      };

      cleanup();
    };
  }, []);

  const runQuery = useCallback(async (sql: string): Promise<QueryResult> => {
    const conn = connRef.current;
    if (!conn) throw new Error("DuckDB is not initialized");
    return runDuckDBQuery(conn, sql);
  }, []);

  const loadCSV = useCallback(
    async (tableName: string, csvContent: string): Promise<DatasetSchema> => {
      const db = dbRef.current;
      const conn = connRef.current;
      if (!db || !conn) throw new Error("DuckDB is not initialized");
      return loadDuckDBCSV(db, conn, tableName, csvContent);
    },
    []
  );

  const contextValue = useMemo<DuckDBContextValue>(
    () => ({
      status,
      db: dbRef.current,
      connection: connRef.current,
      error,
      runQuery,
      loadCSV,
    }),
    [status, error, runQuery, loadCSV]
  );

  return (
    <DuckDBContext.Provider value={contextValue}>
      {children}
    </DuckDBContext.Provider>
  );
};

const useDuckDB = (): DuckDBContextValue => {
  const context = useContext(DuckDBContext);
  if (!context) {
    throw new Error("useDuckDB must be used within a <DuckDBProvider>");
  }
  return context;
};

export { DuckDBProvider, useDuckDB };

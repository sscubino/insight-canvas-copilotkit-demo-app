"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import * as duckdb from "@duckdb/duckdb-wasm";
import type {
  ColumnSchema,
  DatasetSchema,
  DuckDBContextValue,
  DuckDBStatus,
  QueryResult,
} from "./types";

export const DuckDBContext = createContext<DuckDBContextValue | null>(null);

type DuckDBProviderProps = {
  children: ReactNode;
};

export const DuckDBProvider = ({ children }: DuckDBProviderProps) => {
  const [status, setStatus] = useState<DuckDBStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const dbRef = useRef<duckdb.AsyncDuckDB | null>(null);
  const connRef = useRef<duckdb.AsyncDuckDBConnection | null>(null);

  useEffect(() => {
    let cancelled = false;

    const initDuckDB = async () => {
      const bundles = duckdb.getJsDelivrBundles();
      const bundle = await duckdb.selectBundle(bundles);
      const worker = await duckdb.createWorker(bundle.mainWorker!);
      const logger = new duckdb.ConsoleLogger();
      const db = new duckdb.AsyncDuckDB(logger, worker);
      await db.instantiate(bundle.mainModule);
      return db;
    };

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

    const result = await conn.query(sql);
    const columns = result.schema.fields.map((f) => f.name);
    const rows = result.toArray().map((row) => {
      const obj: Record<string, unknown> = {};
      for (const col of columns) {
        obj[col] = row[col];
      }
      return obj;
    });

    return { columns, rows, rowCount: rows.length };
  }, []);

  const extractSchema = useCallback(
    async (tableName: string): Promise<DatasetSchema> => {
      const describeResult = await runQuery(
        `DESCRIBE SELECT * FROM ${tableName}`
      );
      const columns: ColumnSchema[] = describeResult.rows.map((row) => ({
        name: row.column_name as string,
        type: row.column_type as string,
      }));

      const countResult = await runQuery(
        `SELECT COUNT(*) as count FROM ${tableName}`
      );
      const rowCount = Number(countResult.rows[0]?.count ?? 0);

      return { tableName, columns, rowCount };
    },
    [runQuery]
  );

  const loadCSV = useCallback(
    async (tableName: string, csvContent: string): Promise<DatasetSchema> => {
      const db = dbRef.current;
      const conn = connRef.current;
      if (!db || !conn) throw new Error("DuckDB is not initialized");

      const fileName = `${tableName}.csv`;
      await db.registerFileText(fileName, csvContent);
      await conn.query(
        `CREATE OR REPLACE TABLE ${tableName} AS SELECT * FROM read_csv_auto('${fileName}')`
      );

      const datasetSchema = await extractSchema(tableName);
      return datasetSchema;
    },
    [extractSchema]
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

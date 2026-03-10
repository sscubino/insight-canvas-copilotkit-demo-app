"use client";

import { useContext } from "react";
import { DuckDBContext } from "./duckdb-provider";
import type { DuckDBContextValue } from "./types";

export const useDuckDB = (): DuckDBContextValue => {
  const context = useContext(DuckDBContext);

  if (!context) {
    throw new Error("useDuckDB must be used within a <DuckDBProvider>");
  }

  return context;
};

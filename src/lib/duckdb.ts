import * as duckdb from "@duckdb/duckdb-wasm";
import type { ColumnSchema, DatasetSchema, QueryResult } from "@/types/duckdb";

export const initDuckDB = async (): Promise<duckdb.AsyncDuckDB> => {
  const bundles = duckdb.getJsDelivrBundles();
  const bundle = await duckdb.selectBundle(bundles);
  const worker = await duckdb.createWorker(bundle.mainWorker!);
  const logger = new duckdb.ConsoleLogger();
  const db = new duckdb.AsyncDuckDB(logger, worker);
  await db.instantiate(bundle.mainModule);
  return db;
};

export const runQuery = async (
  conn: duckdb.AsyncDuckDBConnection,
  sql: string
): Promise<QueryResult> => {
  const result = await conn.query(sql);
  const columns = result.schema.fields.map((f) => f.name);
  const rows = result.toArray().map((row) => {
    const obj: Record<string, unknown> = {};
    for (const col of columns) {
      const value = row[col];
      obj[col] = typeof value === "bigint" ? Number(value) : value;
    }
    return obj;
  });

  return { columns, rows, rowCount: rows.length };
};

export const extractSchema = async (
  conn: duckdb.AsyncDuckDBConnection,
  tableName: string
): Promise<DatasetSchema> => {
  const describeResult = await runQuery(
    conn,
    `DESCRIBE SELECT * FROM ${tableName}`
  );
  const columns: ColumnSchema[] = describeResult.rows.map((row) => ({
    name: row.column_name as string,
    type: row.column_type as string,
  }));

  const countResult = await runQuery(
    conn,
    `SELECT COUNT(*) as count FROM ${tableName}`
  );
  const rowCount = Number(countResult.rows[0]?.count ?? 0);

  return { tableName, columns, rowCount };
};

export const loadCSV = async (
  db: duckdb.AsyncDuckDB,
  conn: duckdb.AsyncDuckDBConnection,
  tableName: string,
  csvContent: string
): Promise<DatasetSchema> => {
  const fileName = `${tableName}.csv`;
  await db.registerFileText(fileName, csvContent);
  await conn.query(
    `CREATE OR REPLACE TABLE ${tableName} AS SELECT * FROM read_csv_auto('${fileName}')`
  );

  return extractSchema(conn, tableName);
};

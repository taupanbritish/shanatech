import { Pool, type QueryResultRow } from "pg";

const globalForPg = globalThis as unknown as { shanatechPool?: Pool };

export const pool =
  globalForPg.shanatechPool ??
  new Pool({
    connectionString:
      process.env.DATABASE_URL ?? "postgres://shanatech:shanatech@127.0.0.1:5433/shanatech",
    max: 10,
    idleTimeoutMillis: 30_000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPg.shanatechPool = pool;
}

export function query<T extends QueryResultRow>(text: string, values?: unknown[]) {
  return pool.query<T>(text, values);
}

import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("Missing DATABASE_URL in environment");

declare global {
  // allow global pooling in dev so HMR doesn't create new pools each reload
  var __pgPool: Pool | undefined;
}

export const pool: Pool =
  global.__pgPool ??
  new Pool({
    connectionString,
  });

if (process.env.NODE_ENV !== "production") global.__pgPool = pool;

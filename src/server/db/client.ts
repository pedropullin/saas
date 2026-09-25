import "server-only";
import path from "node:path";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

export type Db = NodePgDatabase<typeof schema>;

const globalForDb = globalThis as unknown as { __prospectaDb?: Promise<Db> };
const MIGRATION_LOCK = 727_274;

/**
 * Conexão única por processo.
 *  - Com DATABASE_URL: Postgres (Supabase, Neon, RDS…), migrações com advisory lock.
 *  - Sem DATABASE_URL: PGlite (Postgres embutido) salvo em .data/pglite, para uso local.
 */
export function getDb(): Promise<Db> {
  if (!globalForDb.__prospectaDb) {
    globalForDb.__prospectaDb = connect().catch((error) => {
      globalForDb.__prospectaDb = undefined;
      throw error;
    });
  }
  return globalForDb.__prospectaDb;
}

function sslOption(url: string) {
  const mode = process.env.DATABASE_SSL;
  if (mode === "disable") return undefined;
  const host = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return "";
    }
  })();
  if (!mode && (host === "localhost" || host === "127.0.0.1")) return undefined;
  return { rejectUnauthorized: mode === "strict" };
}

async function connect(): Promise<Db> {
  const migrationsFolder = path.join(process.cwd(), "drizzle");
  const url = process.env.DATABASE_URL;

  if (url) {
    const { Pool } = await import("pg");
    const { drizzle } = await import("drizzle-orm/node-postgres");
    const pool = new Pool({
      connectionString: url,
      max: Number(process.env.DATABASE_POOL_MAX ?? 5),
      ssl: sslOption(url),
    });
    const db = drizzle(pool, { schema });
    if (process.env.DB_AUTO_MIGRATE !== "false") {
      const { migrate } = await import("drizzle-orm/node-postgres/migrator");
      const lock = await pool.connect();
      try {
        await lock.query("select pg_advisory_lock($1)", [MIGRATION_LOCK]);
        await migrate(db, { migrationsFolder });
      } finally {
        await lock.query("select pg_advisory_unlock($1)", [MIGRATION_LOCK]).catch(() => null);
        lock.release();
      }
    }
    return db;
  }

  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  const dataDir = process.env.PGLITE_DATA_DIR ?? path.join(process.cwd(), ".data", "pglite");
  const client = dataDir.startsWith("memory://") ? new PGlite() : new PGlite(dataDir);
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder });
  return db as unknown as Db;
}

export { schema };

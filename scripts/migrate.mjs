// Aplica as migrações no Postgres de DATABASE_URL: `npm run db:migrate`.
import path from "node:path";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("Defina DATABASE_URL. Sem ela o app usa o PGlite local e migra sozinho.");
  process.exit(1);
}
const ssl = process.env.DATABASE_SSL === "disable" ? undefined : { rejectUnauthorized: process.env.DATABASE_SSL === "strict" };
const pool = new pg.Pool({ connectionString: url, ssl: /localhost|127\.0\.0\.1/.test(url) ? undefined : ssl });
await migrate(drizzle(pool), { migrationsFolder: path.join(process.cwd(), "drizzle") });
await pool.end();
console.log("Migrações aplicadas.");

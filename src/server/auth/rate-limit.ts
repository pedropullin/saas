import "server-only";
import { sql } from "drizzle-orm";
import { getDb } from "../db/client";

/**
 * Janela fixa guardada no banco (funciona com várias instâncias).
 * Retorna true se ainda está dentro do limite.
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const db = await getDb();
  const result = await db.execute(sql`
    insert into rate_limits (key, count, reset_at)
    values (${key}, 1, now() + make_interval(secs => ${windowSeconds}))
    on conflict (key) do update set
      count = case when rate_limits.reset_at < now() then 1 else rate_limits.count + 1 end,
      reset_at = case when rate_limits.reset_at < now() then now() + make_interval(secs => ${windowSeconds}) else rate_limits.reset_at end
    returning count
  `);
  const rows = (result as unknown as { rows: Array<{ count: number }> }).rows;
  return Number(rows[0]?.count ?? 0) <= limit;
}

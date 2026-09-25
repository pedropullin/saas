import "server-only";
import { and, desc, eq } from "drizzle-orm";
import type { AuthContext } from "../auth/session";
import { getDb } from "../db/client";
import { searches } from "../db/schema";

/** Histórico pessoal: cada usuário vê só as próprias pesquisas. */
export async function listHistory(auth: AuthContext, limit = 100) {
  const db = await getDb();
  const rows = await db
    .select({
      id: searches.id,
      query: searches.query,
      params: searches.params,
      resultCount: searches.resultCount,
      provider: searches.provider,
      createdAt: searches.createdAt,
    })
    .from(searches)
    .where(and(eq(searches.orgId, auth.org.id), eq(searches.userId, auth.user.id)))
    .orderBy(desc(searches.createdAt))
    .limit(limit);
  return rows.map((row) => ({ ...row, createdAt: row.createdAt.toISOString() }));
}

export async function deleteHistory(auth: AuthContext, id?: string) {
  const db = await getDb();
  const conditions = [eq(searches.orgId, auth.org.id), eq(searches.userId, auth.user.id)];
  if (id) conditions.push(eq(searches.id, id));
  await db.delete(searches).where(and(...conditions));
}

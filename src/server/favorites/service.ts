import "server-only";
import { and, desc, eq } from "drizzle-orm";
import type { Place } from "@/lib/types";
import type { AuthContext } from "../auth/session";
import { upsertCompanies } from "../companies/service";
import { getDb } from "../db/client";
import { companies, favorites, leads } from "../db/schema";

/** Favoritos são pessoais (por usuário), dentro da organização atual. */
export async function toggleFavorite(auth: AuthContext, place: Place): Promise<boolean> {
  const companyIds = await upsertCompanies(auth.org.id, [place]);
  const companyId = companyIds.get(place.id)!;
  const db = await getDb();
  const removed = await db
    .delete(favorites)
    .where(and(eq(favorites.userId, auth.user.id), eq(favorites.companyId, companyId)))
    .returning({ companyId: favorites.companyId });
  if (removed.length) return false;
  await db.insert(favorites).values({ userId: auth.user.id, orgId: auth.org.id, companyId }).onConflictDoNothing();
  return true;
}

export async function removeFavorite(auth: AuthContext, companyId: string) {
  const db = await getDb();
  await db.delete(favorites).where(and(eq(favorites.userId, auth.user.id), eq(favorites.orgId, auth.org.id), eq(favorites.companyId, companyId)));
}

export async function listFavorites(auth: AuthContext) {
  const db = await getDb();
  const rows = await db
    .select({
      companyId: companies.id,
      placeId: companies.placeId,
      source: companies.source,
      place: companies.data,
      enrichment: companies.enrichment,
      leadId: leads.id,
      leadStatus: leads.status,
      addedAt: favorites.createdAt,
    })
    .from(favorites)
    .innerJoin(companies, eq(companies.id, favorites.companyId))
    .leftJoin(leads, eq(leads.companyId, companies.id))
    .where(and(eq(favorites.userId, auth.user.id), eq(favorites.orgId, auth.org.id)))
    .orderBy(desc(favorites.createdAt));
  return rows.map((row) => ({ ...row, addedAt: row.addedAt.toISOString() }));
}

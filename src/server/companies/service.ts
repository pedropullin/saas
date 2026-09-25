import "server-only";
import { and, eq, inArray, sql } from "drizzle-orm";
import type { Enrichment, Place, SavedState } from "@/lib/types";
import { EMPTY_SAVED } from "@/lib/types";
import { getDb } from "../db/client";
import { companies, favorites, leads, listItems, type CompanySource } from "../db/schema";

/** Cria ou atualiza as empresas da organização a partir dos dados do provedor. Retorna placeId → companyId. */
export async function upsertCompanies(orgId: string, places: Place[]): Promise<Map<string, string>> {
  if (!places.length) return new Map();
  const db = await getDb();
  const unique = [...new Map(places.map((p) => [p.id, p])).values()];
  const rows = await db
    .insert(companies)
    .values(
      unique.map((place) => ({
        orgId,
        placeId: place.id,
        source: (place.demo ? "demo" : "google") as CompanySource,
        name: place.name,
        data: place,
        fetchedAt: new Date(),
      })),
    )
    .onConflictDoUpdate({
      target: [companies.orgId, companies.placeId],
      targetWhere: sql`${companies.placeId} is not null`,
      set: { name: sql`excluded.name`, data: sql`excluded.data`, fetchedAt: sql`excluded.fetched_at` },
    })
    .returning({ id: companies.id, placeId: companies.placeId });
  return new Map(rows.map((row) => [row.placeId!, row.id]));
}

export async function createManualCompany(orgId: string, place: Place, source: CompanySource): Promise<string> {
  const db = await getDb();
  const [row] = await db
    .insert(companies)
    .values({ orgId, placeId: null, source, name: place.name, data: place })
    .returning({ id: companies.id });
  return row!.id;
}

export async function getCompany(orgId: string, companyId: string) {
  const db = await getDb();
  const [row] = await db.select().from(companies).where(and(eq(companies.orgId, orgId), eq(companies.id, companyId))).limit(1);
  return row ?? null;
}

export async function getCompanyByPlace(orgId: string, placeId: string) {
  const db = await getDb();
  const [row] = await db.select().from(companies).where(and(eq(companies.orgId, orgId), eq(companies.placeId, placeId))).limit(1);
  return row ?? null;
}

export async function setEnrichment(orgId: string, byPlace: Record<string, Enrichment>): Promise<void> {
  const db = await getDb();
  for (const [placeId, enrichment] of Object.entries(byPlace)) {
    await db
      .update(companies)
      .set({ enrichment })
      .where(and(eq(companies.orgId, orgId), eq(companies.placeId, placeId)));
  }
}

/** Para cada placeId: já é lead? favorito deste usuário? em quais listas? */
export async function savedStateFor(
  orgId: string,
  userId: string,
  placeIds: string[],
): Promise<{ saved: Record<string, SavedState>; enrichment: Record<string, Enrichment | null> }> {
  const saved: Record<string, SavedState> = {};
  const enrichment: Record<string, Enrichment | null> = {};
  if (!placeIds.length) return { saved, enrichment };
  const db = await getDb();
  const rows = await db
    .select({
      companyId: companies.id,
      placeId: companies.placeId,
      enrichment: companies.enrichment,
      leadId: leads.id,
      leadStatus: leads.status,
    })
    .from(companies)
    .leftJoin(leads, eq(leads.companyId, companies.id))
    .where(and(eq(companies.orgId, orgId), inArray(companies.placeId, placeIds)));
  if (!rows.length) return { saved, enrichment };

  const companyIds = rows.map((r) => r.companyId);
  const favs = await db
    .select({ companyId: favorites.companyId })
    .from(favorites)
    .where(and(eq(favorites.userId, userId), inArray(favorites.companyId, companyIds)));
  const items = await db
    .select({ companyId: listItems.companyId, listId: listItems.listId })
    .from(listItems)
    .where(inArray(listItems.companyId, companyIds));
  const favSet = new Set(favs.map((f) => f.companyId));

  for (const row of rows) {
    saved[row.placeId!] = {
      ...EMPTY_SAVED,
      companyId: row.companyId,
      leadId: row.leadId,
      leadStatus: row.leadStatus,
      favorite: favSet.has(row.companyId),
      listIds: items.filter((i) => i.companyId === row.companyId).map((i) => i.listId),
    };
    enrichment[row.placeId!] = row.enrichment ?? null;
  }
  return { saved, enrichment };
}

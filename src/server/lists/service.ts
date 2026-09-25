import "server-only";
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { getPlan } from "@/lib/plans";
import type { Enrichment, Place } from "@/lib/types";
import { logActivity } from "../activity/service";
import type { AuthContext } from "../auth/session";
import { upsertCompanies } from "../companies/service";
import { getDb } from "../db/client";
import { companies, leads, listItems, lists, users } from "../db/schema";
import { AppError, NotFoundError, PlanLimitError } from "../errors";

export async function listLists(orgId: string) {
  const db = await getDb();
  return db
    .select({
      id: lists.id,
      name: lists.name,
      description: lists.description,
      createdAt: lists.createdAt,
      updatedAt: lists.updatedAt,
      createdByName: users.name,
      count: sql<number>`(select count(*)::int from ${listItems} where ${listItems.listId} = ${lists.id})`,
    })
    .from(lists)
    .leftJoin(users, eq(users.id, lists.createdBy))
    .where(eq(lists.orgId, orgId))
    .orderBy(desc(lists.updatedAt));
}

async function requireList(orgId: string, listId: string) {
  const db = await getDb();
  const [list] = await db.select().from(lists).where(and(eq(lists.orgId, orgId), eq(lists.id, listId))).limit(1);
  if (!list) throw new NotFoundError("Lista não encontrada.");
  return list;
}

export async function createList(auth: AuthContext, name: string, description?: string | null) {
  const db = await getDb();
  const plan = getPlan(auth.org.plan);
  const [{ n }] = (await db.select({ n: sql<number>`count(*)::int` }).from(lists).where(eq(lists.orgId, auth.org.id))) as [{ n: number }];
  if (n >= plan.maxLists) throw new PlanLimitError(`O plano ${plan.name} permite até ${plan.maxLists} listas.`);
  const clean = name.trim();
  if (!clean) throw new AppError("Dê um nome para a lista.");
  const [list] = await db
    .insert(lists)
    .values({ orgId: auth.org.id, name: clean.slice(0, 80), description: description?.trim().slice(0, 300) || null, createdBy: auth.user.id })
    .returning({ id: lists.id, name: lists.name });
  await logActivity({ orgId: auth.org.id, userId: auth.user.id, type: "lista_criada", summary: `criou a lista “${list!.name}”`, entityId: list!.id });
  return list!;
}

export async function updateList(auth: AuthContext, listId: string, patch: { name?: string; description?: string | null }) {
  await requireList(auth.org.id, listId);
  const db = await getDb();
  await db
    .update(lists)
    .set({
      ...(patch.name !== undefined ? { name: patch.name.trim().slice(0, 80) || "Sem nome" } : {}),
      ...(patch.description !== undefined ? { description: patch.description?.trim().slice(0, 300) || null } : {}),
      updatedAt: new Date(),
    })
    .where(eq(lists.id, listId));
}

export async function deleteList(auth: AuthContext, listId: string) {
  await requireList(auth.org.id, listId);
  const db = await getDb();
  await db.delete(lists).where(eq(lists.id, listId));
}

/** Adiciona empresas (do resultado da busca) a uma lista. */
export async function addPlacesToList(auth: AuthContext, listId: string, places: Place[]): Promise<number> {
  const list = await requireList(auth.org.id, listId);
  const companyIds = await upsertCompanies(auth.org.id, places);
  return addCompaniesToList(auth, list.id, list.name, [...companyIds.values()]);
}

export async function addCompanyIdsToList(auth: AuthContext, listId: string, companyIds: string[]): Promise<number> {
  const list = await requireList(auth.org.id, listId);
  const db = await getDb();
  const owned = await db
    .select({ id: companies.id })
    .from(companies)
    .where(and(eq(companies.orgId, auth.org.id), inArray(companies.id, companyIds)));
  return addCompaniesToList(auth, list.id, list.name, owned.map((c) => c.id));
}

async function addCompaniesToList(auth: AuthContext, listId: string, listName: string, companyIds: string[]) {
  if (!companyIds.length) return 0;
  const db = await getDb();
  const inserted = await db
    .insert(listItems)
    .values(companyIds.map((companyId) => ({ listId, companyId, addedBy: auth.user.id })))
    .onConflictDoNothing()
    .returning({ companyId: listItems.companyId });
  await db.update(lists).set({ updatedAt: new Date() }).where(eq(lists.id, listId));
  if (inserted.length) {
    await logActivity({
      orgId: auth.org.id,
      userId: auth.user.id,
      type: "lista_adicao",
      summary: `adicionou ${inserted.length === 1 ? "1 empresa" : `${inserted.length} empresas`} à lista “${listName}”`,
      entityId: listId,
    });
  }
  return inserted.length;
}

export async function removeFromList(auth: AuthContext, listId: string, companyIds: string[]) {
  await requireList(auth.org.id, listId);
  const db = await getDb();
  await db.delete(listItems).where(and(eq(listItems.listId, listId), inArray(listItems.companyId, companyIds)));
}

export interface CompanyRow {
  companyId: string;
  placeId: string | null;
  source: string;
  place: Place;
  enrichment: Enrichment | null;
  leadId: string | null;
  leadStatus: string | null;
  addedAt: string;
}

export async function getListWithItems(orgId: string, listId: string) {
  const list = await requireList(orgId, listId);
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
      addedAt: listItems.addedAt,
    })
    .from(listItems)
    .innerJoin(companies, eq(companies.id, listItems.companyId))
    .leftJoin(leads, eq(leads.companyId, companies.id))
    .where(and(eq(listItems.listId, listId), eq(companies.orgId, orgId)))
    .orderBy(asc(companies.name));
  return {
    list,
    items: rows.map((row) => ({ ...row, addedAt: row.addedAt.toISOString() })) as CompanyRow[],
  };
}

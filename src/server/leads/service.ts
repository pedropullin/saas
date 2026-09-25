import "server-only";
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { contactFacts, hasFact } from "@/lib/contact";
import { STATUS_LABEL, type LeadStatus, type LeadView } from "@/lib/leads";
import { getPlan } from "@/lib/plans";
import type { Enrichment, Place } from "@/lib/types";
import { logActivity } from "../activity/service";
import type { AuthContext } from "../auth/session";
import { createManualCompany, upsertCompanies } from "../companies/service";
import { getDb } from "../db/client";
import { companies, leadEvents, leads, memberships, users, type LeadEventKind } from "../db/schema";
import { AppError, NotFoundError, PlanLimitError } from "../errors";
import { notify } from "../notifications/service";

const leadColumns = {
  id: leads.id,
  companyId: leads.companyId,
  placeId: companies.placeId,
  status: leads.status,
  position: leads.position,
  companyName: leads.companyName,
  contactName: leads.contactName,
  phone: leads.phone,
  whatsapp: leads.whatsapp,
  website: leads.website,
  instagram: leads.instagram,
  email: leads.email,
  notes: leads.notes,
  tags: leads.tags,
  assignedTo: leads.assignedTo,
  assignedName: users.name,
  createdBy: leads.createdBy,
  firstContactAt: leads.firstContactAt,
  lastContactAt: leads.lastContactAt,
  createdAt: leads.createdAt,
  updatedAt: leads.updatedAt,
  data: companies.data,
};

type LeadRow = {
  [K in keyof typeof leadColumns]: unknown;
} & { data: Place; firstContactAt: Date | null; lastContactAt: Date | null; createdAt: Date; updatedAt: Date };

function toView(row: LeadRow): LeadView {
  const iso = (date: Date | null) => (date ? date.toISOString() : null);
  return {
    id: row.id as string,
    companyId: row.companyId as string,
    placeId: (row.placeId as string | null) ?? null,
    status: row.status as LeadStatus,
    position: row.position as number,
    companyName: row.companyName as string,
    contactName: row.contactName as string | null,
    phone: row.phone as string | null,
    whatsapp: row.whatsapp as string | null,
    website: row.website as string | null,
    instagram: row.instagram as string | null,
    email: row.email as string | null,
    notes: row.notes as string,
    tags: (row.tags as string[]) ?? [],
    assignedTo: row.assignedTo as string | null,
    assignedName: (row.assignedName as string | null) ?? null,
    createdBy: row.createdBy as string | null,
    firstContactAt: iso(row.firstContactAt),
    lastContactAt: iso(row.lastContactAt),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    category: row.data?.category ?? null,
    city: row.data?.city ?? null,
    rating: row.data?.rating ?? null,
    reviewCount: row.data?.reviewCount ?? null,
    demo: Boolean(row.data?.demo),
  };
}

export async function listLeads(orgId: string, options: { ids?: string[]; status?: LeadStatus } = {}): Promise<LeadView[]> {
  const db = await getDb();
  const conditions = [eq(leads.orgId, orgId)];
  if (options.ids?.length) conditions.push(inArray(leads.id, options.ids));
  if (options.status) conditions.push(eq(leads.status, options.status));
  const rows = await db
    .select(leadColumns)
    .from(leads)
    .innerJoin(companies, eq(companies.id, leads.companyId))
    .leftJoin(users, eq(users.id, leads.assignedTo))
    .where(and(...conditions))
    .orderBy(asc(leads.position), desc(leads.updatedAt));
  return rows.map((row) => toView(row as unknown as LeadRow));
}

export async function getLead(orgId: string, leadId: string) {
  const db = await getDb();
  const [row] = await db
    .select({ ...leadColumns, enrichment: companies.enrichment })
    .from(leads)
    .innerJoin(companies, eq(companies.id, leads.companyId))
    .leftJoin(users, eq(users.id, leads.assignedTo))
    .where(and(eq(leads.orgId, orgId), eq(leads.id, leadId)))
    .limit(1);
  if (!row) return null;
  const events = await db
    .select({ id: leadEvents.id, kind: leadEvents.kind, body: leadEvents.body, createdAt: leadEvents.createdAt, authorName: users.name })
    .from(leadEvents)
    .leftJoin(users, eq(users.id, leadEvents.authorId))
    .where(and(eq(leadEvents.orgId, orgId), eq(leadEvents.leadId, leadId)))
    .orderBy(desc(leadEvents.createdAt))
    .limit(100);
  return {
    lead: toView(row as unknown as LeadRow),
    place: row.data as Place,
    enrichment: (row.enrichment as Enrichment | null) ?? null,
    events: events.map((e) => ({ ...e, createdAt: e.createdAt.toISOString() })),
  };
}

async function countLeads(orgId: string): Promise<number> {
  const db = await getDb();
  const [row] = await db.select({ n: sql<number>`count(*)::int` }).from(leads).where(eq(leads.orgId, orgId));
  return row?.n ?? 0;
}

async function assertLeadCapacity(auth: AuthContext, adding: number) {
  const plan = getPlan(auth.org.plan);
  const current = await countLeads(auth.org.id);
  if (current + adding > plan.maxLeads) {
    throw new PlanLimitError(`O plano ${plan.name} permite até ${plan.maxLeads.toLocaleString("pt-BR")} leads (você tem ${current}).`);
  }
}

async function nextPosition(orgId: string, status: LeadStatus): Promise<number> {
  const db = await getDb();
  const [row] = await db
    .select({ max: sql<number>`coalesce(max(${leads.position}), 0)` })
    .from(leads)
    .where(and(eq(leads.orgId, orgId), eq(leads.status, status)));
  return Number(row?.max ?? 0) + 1;
}

async function addEvent(orgId: string, leadId: string, authorId: string | null, kind: LeadEventKind, body: string) {
  const db = await getDb();
  await db.insert(leadEvents).values({ orgId, leadId, authorId, kind, body: body.slice(0, 4000) });
}

/** Cria leads a partir de empresas encontradas. Empresas que já são lead são ignoradas. */
export async function createLeadsFromPlaces(
  auth: AuthContext,
  places: Place[],
  enrichment: Record<string, Enrichment | null> = {},
): Promise<{ created: number; leadIds: Record<string, string> }> {
  const companyIds = await upsertCompanies(auth.org.id, places);
  const db = await getDb();
  const existing = await db
    .select({ companyId: leads.companyId, id: leads.id })
    .from(leads)
    .where(and(eq(leads.orgId, auth.org.id), inArray(leads.companyId, [...companyIds.values()])));
  const existingByCompany = new Map(existing.map((e) => [e.companyId, e.id]));
  const fresh = places.filter((p) => !existingByCompany.has(companyIds.get(p.id)!));
  await assertLeadCapacity(auth, fresh.length);

  let position = await nextPosition(auth.org.id, "novo");
  const leadIds: Record<string, string> = {};
  for (const place of places) {
    const companyId = companyIds.get(place.id)!;
    const known = existingByCompany.get(companyId);
    if (known) {
      leadIds[place.id] = known;
      continue;
    }
    const facts = contactFacts(place, enrichment[place.id]);
    const [row] = await db
      .insert(leads)
      .values({
        orgId: auth.org.id,
        companyId,
        status: "novo",
        position: position++,
        companyName: place.name,
        phone: hasFact(facts.phone) ? facts.phone.value : null,
        whatsapp: hasFact(facts.whatsapp) && facts.whatsapp.value.number ? `+${facts.whatsapp.value.number}` : null,
        website: hasFact(facts.website) ? facts.website.value : null,
        instagram: hasFact(facts.instagram) ? facts.instagram.value : null,
        email: hasFact(facts.email) ? facts.email.value : null,
        createdBy: auth.user.id,
        assignedTo: auth.user.id,
      })
      .onConflictDoNothing()
      .returning({ id: leads.id });
    if (row) {
      leadIds[place.id] = row.id;
      await addEvent(auth.org.id, row.id, auth.user.id, "sistema", "Lead criado a partir da prospecção.");
    }
  }
  if (fresh.length) {
    const first = fresh[0]!.name;
    await logActivity({
      orgId: auth.org.id,
      userId: auth.user.id,
      type: "lead_criado",
      summary: fresh.length === 1 ? `adicionou ${first} aos leads` : `adicionou ${fresh.length} empresas aos leads`,
      entityId: fresh.length === 1 ? leadIds[fresh[0]!.id] : null,
    });
  }
  return { created: fresh.length, leadIds };
}

async function requireLead(orgId: string, leadId: string) {
  const db = await getDb();
  const [lead] = await db.select().from(leads).where(and(eq(leads.orgId, orgId), eq(leads.id, leadId))).limit(1);
  if (!lead) throw new NotFoundError("Lead não encontrado.");
  return lead;
}

export interface LeadPatch {
  companyName?: string;
  contactName?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  website?: string | null;
  instagram?: string | null;
  email?: string | null;
  notes?: string;
  tags?: string[];
  assignedTo?: string | null;
}

export async function updateLead(auth: AuthContext, leadId: string, patch: LeadPatch) {
  const lead = await requireLead(auth.org.id, leadId);
  const db = await getDb();
  if (patch.assignedTo) {
    const [member] = await db
      .select({ userId: memberships.userId })
      .from(memberships)
      .where(and(eq(memberships.orgId, auth.org.id), eq(memberships.userId, patch.assignedTo)))
      .limit(1);
    if (!member) throw new AppError("Esse usuário não faz parte da equipe.");
  }
  await db
    .update(leads)
    .set({ ...patch, updatedAt: new Date() })
    .where(and(eq(leads.orgId, auth.org.id), eq(leads.id, leadId)));

  if (patch.assignedTo !== undefined && patch.assignedTo !== lead.assignedTo && patch.assignedTo) {
    const [assignee] = await db.select({ name: users.name }).from(users).where(eq(users.id, patch.assignedTo)).limit(1);
    await addEvent(auth.org.id, leadId, auth.user.id, "sistema", `Responsável: ${assignee?.name ?? "—"}`);
    await logActivity({ orgId: auth.org.id, userId: auth.user.id, type: "lead_atribuido", summary: `atribuiu ${lead.companyName} a ${assignee?.name}`, entityId: leadId });
    if (patch.assignedTo !== auth.user.id) {
      await notify({ orgId: auth.org.id, userIds: [patch.assignedTo], title: `${auth.user.name} atribuiu um lead a você`, body: lead.companyName, href: `/app/leads?lead=${leadId}` });
    }
  }
}

export async function moveLeads(auth: AuthContext, leadIds: string[], status: LeadStatus, position?: number) {
  const db = await getDb();
  const rows = await db.select().from(leads).where(and(eq(leads.orgId, auth.org.id), inArray(leads.id, leadIds)));
  if (!rows.length) throw new NotFoundError("Lead não encontrado.");
  let nextPos = position ?? (await nextPosition(auth.org.id, status));
  for (const lead of rows) {
    const contactedNow = lead.status === "novo" && status !== "novo" && status !== "nao_interessado";
    await db
      .update(leads)
      .set({
        status,
        position: nextPos++,
        updatedAt: new Date(),
        ...(contactedNow && !lead.firstContactAt ? { firstContactAt: new Date() } : {}),
      })
      .where(eq(leads.id, lead.id));
    if (lead.status !== status) {
      await addEvent(auth.org.id, lead.id, auth.user.id, "status", `${STATUS_LABEL[lead.status]} → ${STATUS_LABEL[status]}`);
    }
  }
  const changed = rows.filter((r) => r.status !== status);
  if (changed.length) {
    await logActivity({
      orgId: auth.org.id,
      userId: auth.user.id,
      type: "lead_status",
      summary:
        changed.length === 1
          ? `moveu ${changed[0]!.companyName} para ${STATUS_LABEL[status]}`
          : `moveu ${changed.length} leads para ${STATUS_LABEL[status]}`,
      entityId: changed.length === 1 ? changed[0]!.id : null,
    });
  }
}

/** Clique em WhatsApp/Ligar: registra o contato e tira o lead de "Novo". */
export async function registerContact(auth: AuthContext, leadId: string, channel: "whatsapp" | "ligacao") {
  const lead = await requireLead(auth.org.id, leadId);
  const db = await getDb();
  const now = new Date();
  await db
    .update(leads)
    .set({
      lastContactAt: now,
      firstContactAt: lead.firstContactAt ?? now,
      status: lead.status === "novo" ? "contatado" : lead.status,
      updatedAt: now,
    })
    .where(eq(leads.id, leadId));
  await addEvent(auth.org.id, leadId, auth.user.id, channel, channel === "whatsapp" ? "Conversa aberta no WhatsApp." : "Ligação iniciada.");
  await logActivity({
    orgId: auth.org.id,
    userId: auth.user.id,
    type: "lead_contato",
    summary: `${channel === "whatsapp" ? "chamou no WhatsApp" : "ligou para"} ${lead.companyName}`,
    entityId: leadId,
  });
  return { status: (lead.status === "novo" ? "contatado" : lead.status) as LeadStatus };
}

export async function addNote(auth: AuthContext, leadId: string, body: string) {
  const lead = await requireLead(auth.org.id, leadId);
  await addEvent(auth.org.id, leadId, auth.user.id, "nota", body);
  const db = await getDb();
  await db.update(leads).set({ updatedAt: new Date() }).where(eq(leads.id, leadId));
  await logActivity({ orgId: auth.org.id, userId: auth.user.id, type: "lead_nota", summary: `anotou em ${lead.companyName}`, entityId: leadId });
}

export async function deleteLeads(auth: AuthContext, leadIds: string[]) {
  const db = await getDb();
  await db.delete(leads).where(and(eq(leads.orgId, auth.org.id), inArray(leads.id, leadIds)));
}

export interface ImportRow {
  companyName: string;
  contactName?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  website?: string | null;
  instagram?: string | null;
  email?: string | null;
  city?: string | null;
  category?: string | null;
  address?: string | null;
  status?: LeadStatus;
  tags?: string[];
  notes?: string;
}

/** Importa leads de planilha. Cada linha vira uma empresa "importada" + lead. */
export async function importLeads(auth: AuthContext, rows: ImportRow[]): Promise<number> {
  await assertLeadCapacity(auth, rows.length);
  const db = await getDb();
  let position = await nextPosition(auth.org.id, "novo");
  for (const row of rows) {
    const place: Place = {
      id: `import_${crypto.randomUUID().replace(/-/g, "")}`,
      name: row.companyName,
      category: row.category ?? null,
      types: [],
      address: row.address ?? null,
      neighborhood: null,
      city: row.city ?? null,
      state: null,
      country: null,
      postalCode: null,
      location: null,
      rating: null,
      reviewCount: null,
      phone: null,
      whatsapp: null,
      website: row.website ?? null,
      instagram: row.instagram ?? null,
      facebook: null,
      mapsUrl: null,
      openNow: null,
      hours: [],
      status: null,
      priceLevel: null,
      photos: [],
    };
    const companyId = await createManualCompany(auth.org.id, place, "import");
    const [lead] = await db
      .insert(leads)
      .values({
        orgId: auth.org.id,
        companyId,
        status: row.status ?? "novo",
        position: position++,
        companyName: row.companyName,
        contactName: row.contactName ?? null,
        phone: row.phone ?? null,
        whatsapp: row.whatsapp ?? null,
        website: row.website ?? null,
        instagram: row.instagram ?? null,
        email: row.email ?? null,
        notes: row.notes ?? "",
        tags: row.tags ?? [],
        createdBy: auth.user.id,
        assignedTo: auth.user.id,
      })
      .returning({ id: leads.id });
    await addEvent(auth.org.id, lead!.id, auth.user.id, "sistema", "Lead importado de planilha.");
  }
  await logActivity({ orgId: auth.org.id, userId: auth.user.id, type: "importacao", summary: `importou ${rows.length} leads` });
  return rows.length;
}

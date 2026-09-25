"use server";

import { z } from "zod";
import { LEAD_STATUS_IDS } from "@/lib/leads";
import { placeSchema } from "@/lib/place-schema";
import type { Enrichment, Place } from "@/lib/types";
import { withAuth } from "../action";
import { getCompanyByPlace } from "../companies/service";
import { getDb } from "../db/client";
import {
  addNote,
  createLeadsFromPlaces,
  deleteLeads,
  getLead,
  importLeads,
  moveLeads,
  registerContact,
  updateLead,
  type ImportRow,
} from "./service";

const id = z.uuid("Identificador inválido.");
const ids = z.array(id).min(1).max(500);
const status = z.enum(LEAD_STATUS_IDS);
const optional = (max: number) => z.string().trim().max(max).nullable().optional().transform((v) => (v === undefined ? undefined : v || null));

export async function addPlacesToLeadsAction(places: unknown[], enrichment: Record<string, Enrichment | null> = {}) {
  return withAuth(async (auth) => {
    const parsed = z.array(placeSchema).min(1).max(200).parse(places) as Place[];
    return createLeadsFromPlaces(auth, parsed, enrichment);
  });
}

export async function getLeadAction(leadId: string) {
  return withAuth(async (auth) => {
    const lead = await getLead(auth.org.id, id.parse(leadId));
    if (!lead) throw new Error("Lead não encontrado");
    return lead;
  });
}

const patchSchema = z.object({
  companyName: z.string().trim().min(1).max(200).optional(),
  contactName: optional(120),
  phone: optional(40),
  whatsapp: optional(40),
  website: optional(500),
  instagram: optional(500),
  email: z.union([z.email("E-mail inválido."), z.literal(""), z.null()]).optional().transform((v) => (v === undefined ? undefined : v || null)),
  notes: z.string().max(10_000).optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
  assignedTo: z.uuid().nullable().optional(),
});

export async function updateLeadAction(leadId: string, patch: z.input<typeof patchSchema>) {
  return withAuth((auth) => updateLead(auth, id.parse(leadId), patchSchema.parse(patch)));
}

export async function moveLeadsAction(leadIds: string[], nextStatus: string, position?: number) {
  return withAuth((auth) => moveLeads(auth, ids.parse(leadIds), status.parse(nextStatus), position));
}

export async function registerContactAction(leadId: string, channel: "whatsapp" | "ligacao") {
  return withAuth((auth) => registerContact(auth, id.parse(leadId), z.enum(["whatsapp", "ligacao"]).parse(channel)));
}

/** Contato feito a partir da busca: se a empresa já é lead, registra no histórico dela. */
export async function registerPlaceContactAction(placeId: string, channel: "whatsapp" | "ligacao") {
  return withAuth(async (auth) => {
    const company = await getCompanyByPlace(auth.org.id, z.string().max(600).parse(placeId));
    if (!company) return null;
    const db = await getDb();
    const { leads } = await import("../db/schema");
    const { and, eq } = await import("drizzle-orm");
    const [lead] = await db.select({ id: leads.id }).from(leads).where(and(eq(leads.orgId, auth.org.id), eq(leads.companyId, company.id))).limit(1);
    if (!lead) return null;
    return { leadId: lead.id, ...(await registerContact(auth, lead.id, channel)) };
  });
}

export async function addNoteAction(leadId: string, body: string) {
  return withAuth((auth) => addNote(auth, id.parse(leadId), z.string().trim().min(1, "Escreva a observação.").max(4000).parse(body)));
}

export async function deleteLeadsAction(leadIds: string[]) {
  return withAuth((auth) => deleteLeads(auth, ids.parse(leadIds)));
}

const importRow = z.object({
  companyName: z.string().trim().min(1).max(200),
  contactName: optional(120),
  phone: optional(40),
  whatsapp: optional(40),
  website: optional(500),
  instagram: optional(500),
  email: optional(160),
  city: optional(120),
  category: optional(120),
  address: optional(300),
  status: status.optional(),
  tags: z.array(z.string().trim().max(40)).max(20).optional(),
  notes: z.string().max(4000).optional(),
});

export async function importLeadsAction(rows: unknown[]) {
  return withAuth((auth) => importLeads(auth, z.array(importRow).min(1).max(2000).parse(rows) as ImportRow[]));
}

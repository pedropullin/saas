import { createLocalStore } from "./local-store";
import type { Place } from "./types";

export type LeadStatus = "novo" | "contatado" | "respondeu" | "negociando" | "fechado" | "perdido";

export const LEAD_STATUSES: Array<{ id: LeadStatus; label: string }> = [
  { id: "novo", label: "Novo" },
  { id: "contatado", label: "Contatado" },
  { id: "respondeu", label: "Respondeu" },
  { id: "negociando", label: "Negociando" },
  { id: "fechado", label: "Fechado" },
  { id: "perdido", label: "Perdido" },
];

export const STATUS_LABEL = Object.fromEntries(LEAD_STATUSES.map((s) => [s.id, s.label])) as Record<LeadStatus, string>;

export interface Lead {
  place: Place;
  status: LeadStatus;
  notes: string;
  addedAt: string;
  updatedAt: string;
  lastContactAt: string | null;
  contactCount: number;
  addedBy: string | null;
}

type LeadMap = Record<string, Lead>;

const EMPTY: LeadMap = {};

function sanitize(value: unknown): LeadMap {
  if (!value || typeof value !== "object") return EMPTY;
  const result: LeadMap = {};
  for (const [id, lead] of Object.entries(value as Record<string, Lead>)) {
    if (lead && typeof lead === "object" && lead.place?.id === id) result[id] = lead;
  }
  return result;
}

const store = createLocalStore<LeadMap>("prospecta:leads:v1", EMPTY, sanitize);

export const useLeads = store.useValue;
export const getLeads = store.get;

function now(): string {
  return new Date().toISOString();
}

export function saveLead(place: Place, addedBy: string | null, status: LeadStatus = "novo"): void {
  store.set((leads) => {
    const existing = leads[place.id];
    const lead: Lead = existing
      ? { ...existing, place, updatedAt: now() }
      : { place, status, notes: "", addedAt: now(), updatedAt: now(), lastContactAt: null, contactCount: 0, addedBy };
    return { ...leads, [place.id]: lead };
  });
}

export function removeLead(id: string): void {
  store.set((leads) => {
    const next = { ...leads };
    delete next[id];
    return next;
  });
}

export function updateLead(id: string, patch: Partial<Pick<Lead, "status" | "notes">>): void {
  store.set((leads) => {
    const lead = leads[id];
    if (!lead) return leads;
    return { ...leads, [id]: { ...lead, ...patch, updatedAt: now() } };
  });
}

/** Chamou no WhatsApp ou ligou: a empresa entra na lista como "Contatado". */
export function registerContact(place: Place, addedBy: string | null): void {
  store.set((leads) => {
    const existing = leads[place.id];
    const base: Lead = existing ?? {
      place,
      status: "novo",
      notes: "",
      addedAt: now(),
      updatedAt: now(),
      lastContactAt: null,
      contactCount: 0,
      addedBy,
    };
    return {
      ...leads,
      [place.id]: {
        ...base,
        place,
        status: base.status === "novo" ? "contatado" : base.status,
        lastContactAt: now(),
        contactCount: base.contactCount + 1,
        updatedAt: now(),
      },
    };
  });
}

/** Salva várias empresas de uma vez (sem sobrescrever status/notas das que já estão na lista). */
export function saveLeads(places: Place[], addedBy: string | null): number {
  let added = 0;
  store.set((leads) => {
    const next = { ...leads };
    for (const place of places) {
      const existing = next[place.id];
      if (existing) {
        next[place.id] = { ...existing, place };
        continue;
      }
      added++;
      next[place.id] = {
        place,
        status: "novo",
        notes: "",
        addedAt: now(),
        updatedAt: now(),
        lastContactAt: null,
        contactCount: 0,
        addedBy,
      };
    }
    return next;
  });
  return added;
}

/** Junta um backup (de outro amigo ou navegador). Em conflito, vence o registro mais recente. */
export function importLeads(input: unknown): number {
  const incoming = sanitize(input);
  let changed = 0;
  store.set((leads) => {
    const next = { ...leads };
    for (const [id, lead] of Object.entries(incoming)) {
      const current = next[id];
      if (!current || lead.updatedAt > current.updatedAt) {
        next[id] = lead;
        changed++;
      }
    }
    return next;
  });
  return changed;
}

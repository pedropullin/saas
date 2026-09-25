export const LEAD_STATUSES = [
  { id: "novo", label: "Novo" },
  { id: "contatado", label: "Contatado" },
  { id: "negociacao", label: "Em negociação" },
  { id: "cliente", label: "Cliente" },
  { id: "sem_resposta", label: "Sem resposta" },
  { id: "nao_interessado", label: "Não interessado" },
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number]["id"];

export const LEAD_STATUS_IDS = LEAD_STATUSES.map((s) => s.id) as [LeadStatus, ...LeadStatus[]];

export const STATUS_LABEL = Object.fromEntries(LEAD_STATUSES.map((s) => [s.id, s.label])) as Record<LeadStatus, string>;

export function isLeadStatus(value: unknown): value is LeadStatus {
  return typeof value === "string" && (LEAD_STATUS_IDS as string[]).includes(value);
}

/** Considera "contatado" qualquer lead que já passou da etapa inicial. */
export function wasContacted(status: LeadStatus): boolean {
  return status !== "novo";
}

export interface LeadView {
  id: string;
  companyId: string;
  placeId: string | null;
  status: LeadStatus;
  position: number;
  companyName: string;
  contactName: string | null;
  phone: string | null;
  whatsapp: string | null;
  website: string | null;
  instagram: string | null;
  email: string | null;
  notes: string;
  tags: string[];
  assignedTo: string | null;
  assignedName: string | null;
  createdBy: string | null;
  firstContactAt: string | null;
  lastContactAt: string | null;
  createdAt: string;
  updatedAt: string;
  category: string | null;
  city: string | null;
  rating: number | null;
  reviewCount: number | null;
  demo: boolean;
}

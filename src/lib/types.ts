import type { LeadStatus } from "./leads";

/** Grau de certeza de que o número atende no WhatsApp. */
export type WhatsAppConfidence = "confirmado" | "provavel" | "possivel";

export type PhoneKind = "celular" | "fixo" | "fixo_ou_celular" | "outro";

export interface PhoneInfo {
  national: string;
  international: string;
  e164: string;
  kind: PhoneKind;
  country: string | null;
}

export interface WhatsAppInfo {
  /** Só dígitos com DDI, pronto para wa.me. Null quando só há um link curto. */
  number: string | null;
  link: string | null;
  confidence: WhatsAppConfidence;
  source: "link" | "telefone" | "site";
}

export type BusinessStatus = "OPERATIONAL" | "CLOSED_TEMPORARILY" | "CLOSED_PERMANENTLY";

export interface PlacePhoto {
  /** Nome do recurso no provedor (ex.: places/ID/photos/REF). */
  name: string;
  width: number | null;
  height: number | null;
  attributions: Array<{ name: string; uri: string | null }>;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Place {
  id: string;
  name: string;
  category: string | null;
  types: string[];
  address: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  location: LatLng | null;
  rating: number | null;
  reviewCount: number | null;
  phone: PhoneInfo | null;
  whatsapp: WhatsAppInfo | null;
  /** Site próprio. Links de WhatsApp e redes sociais não contam como site. */
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  mapsUrl: string | null;
  openNow: boolean | null;
  /** Horário da semana, de segunda a domingo, como o provedor devolve. */
  hours: string[];
  status: BusinessStatus | null;
  priceLevel: number | null;
  photos: PlacePhoto[];
  /** true quando o dado é fictício (modo demonstração). */
  demo?: boolean;
}

export interface Review {
  author: string;
  authorUri: string | null;
  rating: number;
  text: string;
  when: string;
}

export interface PlaceDetails extends Place {
  reviews: Review[];
  summary: string | null;
}

/** Dados públicos encontrados no site da empresa. */
export interface Enrichment {
  url: string | null;
  ok: boolean;
  emails: string[];
  instagram: string | null;
  facebook: string | null;
  linkedin: string | null;
  whatsapp: string | null;
  fetchedAt: string;
  error?: string;
  demo?: boolean;
}

export interface SavedState {
  companyId: string | null;
  leadId: string | null;
  leadStatus: LeadStatus | null;
  favorite: boolean;
  listIds: string[];
}

export const EMPTY_SAVED: SavedState = { companyId: null, leadId: null, leadStatus: null, favorite: false, listIds: [] };

export interface ResultPlace extends Place {
  distanceKm: number | null;
  saved: SavedState;
  enrichment: Enrichment | null;
}

export interface ApiError {
  error: string;
  code?: string;
}

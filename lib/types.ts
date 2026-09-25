/** Grau de certeza de que o número atende no WhatsApp. */
export type WhatsAppConfidence = "confirmado" | "provavel" | "possivel";

export type PhoneKind = "celular" | "fixo" | "fixo_ou_celular" | "outro";

export interface PhoneInfo {
  /** Formato local, ex.: (11) 98765-4321 */
  national: string;
  /** Formato internacional, ex.: +55 11 98765-4321 */
  international: string;
  /** E.164, ex.: +5511987654321 — usado no tel: */
  e164: string;
  kind: PhoneKind;
  country: string | null;
}

export interface WhatsAppInfo {
  /** Apenas dígitos com DDI, pronto para wa.me. Null quando só há um link curto. */
  number: string | null;
  /** Link de WhatsApp publicado pela própria empresa (wa.me, wa.link…). */
  link: string | null;
  confidence: WhatsAppConfidence;
  source: "link" | "telefone";
}

export type BusinessStatus = "OPERATIONAL" | "CLOSED_TEMPORARILY" | "CLOSED_PERMANENTLY";

export interface Place {
  id: string;
  name: string;
  category: string | null;
  address: string | null;
  city: string | null;
  location: { lat: number; lng: number } | null;
  rating: number | null;
  reviewCount: number;
  phone: PhoneInfo | null;
  whatsapp: WhatsAppInfo | null;
  /** Site "de verdade". Links de WhatsApp/Instagram não contam como site. */
  website: string | null;
  /** Perfil em rede social quando é o único "site" cadastrado. */
  social: string | null;
  mapsUrl: string | null;
  openNow: boolean | null;
  status: BusinessStatus | null;
  /** 0 (grátis) a 4 (muito caro) */
  priceLevel: number | null;
  /** true quando o dado é fictício (modo demonstração). */
  demo?: boolean;
}

export interface Review {
  author: string;
  rating: number;
  text: string;
  when: string;
}

export interface PlaceDetails extends Place {
  hours: string[];
  reviews: Review[];
  summary: string | null;
}

export interface SearchRequest {
  query: string;
  location?: string;
  near?: { lat: number; lng: number; radiusKm: number };
  minRating?: number;
  openNow?: boolean;
  pageToken?: string;
}

export interface SearchResponse {
  places: Place[];
  nextPageToken: string | null;
  demo: boolean;
}

export interface ApiError {
  error: string;
}

import type { Enrichment, Place, WhatsAppInfo } from "./types";

/** Estado de um dado de contato: encontrado, não encontrado ou ainda não verificado. */
export type Found<T> = { state: "found"; value: T } | { state: "missing" } | { state: "unknown" };

export interface ContactFacts {
  website: Found<string>;
  phone: Found<string>;
  whatsapp: Found<WhatsAppInfo>;
  instagram: Found<string>;
  facebook: Found<string>;
  email: Found<string>;
}

const found = <T,>(value: T): Found<T> => ({ state: "found", value });
const missing = { state: "missing" } as const;
const unknown = { state: "unknown" } as const;

/**
 * Junta o que veio do provedor de lugares com o que foi achado no site.
 * Sem site não há onde procurar e-mail/redes, então o dado é "não encontrado".
 */
export function contactFacts(place: Place, enrichment: Enrichment | null | undefined): ContactFacts {
  const scanned = Boolean(enrichment);
  const canScan = Boolean(place.website);
  const fallback = !canScan || scanned ? missing : unknown;

  const siteWhatsApp: WhatsAppInfo | null = enrichment?.whatsapp
    ? { number: enrichment.whatsapp, link: null, confidence: "confirmado", source: "site" }
    : null;
  const whatsapp =
    place.whatsapp?.confidence === "confirmado" ? place.whatsapp : (siteWhatsApp ?? place.whatsapp ?? null);

  const instagram = place.instagram ?? enrichment?.instagram ?? null;
  const facebook = place.facebook ?? enrichment?.facebook ?? null;
  const email = enrichment?.emails[0] ?? null;

  return {
    website: place.website ? found(place.website) : missing,
    phone: place.phone ? found(place.phone.international) : missing,
    whatsapp: whatsapp ? found(whatsapp) : missing,
    instagram: instagram ? found(instagram) : fallback,
    facebook: facebook ? found(facebook) : fallback,
    email: email ? found(email) : fallback,
  };
}

export function hasFact<T>(fact: Found<T>): fact is { state: "found"; value: T } {
  return fact.state === "found";
}

export function instagramHandle(url: string): string {
  try {
    const handle = new URL(url).pathname.split("/").filter(Boolean)[0];
    return handle ? `@${handle}` : url;
  } catch {
    return url;
  }
}

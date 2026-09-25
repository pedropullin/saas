import { parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js/max";
import type { PhoneInfo, PhoneKind, WhatsAppInfo } from "./types";

const KIND_BY_TYPE: Record<string, PhoneKind> = {
  MOBILE: "celular",
  FIXED_LINE: "fixo",
  FIXED_LINE_OR_MOBILE: "fixo_ou_celular",
};

/**
 * Normaliza o telefone vindo do Google (internacional tem prioridade,
 * nacional é usado com a dica de país).
 */
export function parsePhone(
  international: string | null | undefined,
  national: string | null | undefined,
  countryHint?: string | null,
): PhoneInfo | null {
  const hint = (countryHint?.toUpperCase() || undefined) as CountryCode | undefined;
  const candidates: Array<[string, CountryCode | undefined]> = [];
  if (international) candidates.push([international, undefined]);
  if (national) candidates.push([national, hint]);

  for (const [raw, country] of candidates) {
    const parsed = parsePhoneNumberFromString(raw, country);
    if (!parsed || !parsed.isPossible()) continue;
    const type = parsed.getType();
    return {
      national: parsed.formatNational(),
      international: parsed.formatInternational(),
      e164: parsed.number,
      kind: (type && KIND_BY_TYPE[type]) || (type ? "outro" : "fixo_ou_celular"),
      country: parsed.country ?? null,
    };
  }
  return null;
}

const WA_HOSTS = /(^|\.)(wa\.me|whatsapp\.com|wa\.link|whats\.link|api\.whatsapp\.com)$/i;
const INSTAGRAM_HOSTS = /(^|\.)instagram\.com$/i;
const FACEBOOK_HOSTS = /(^|\.)(facebook\.com|fb\.com|fb\.me)$/i;
const OTHER_SOCIAL_HOSTS = /(^|\.)(linktr\.ee|tiktok\.com|linkedin\.com|x\.com|twitter\.com|youtube\.com|beacons\.ai)$/i;

function safeUrl(raw: string | null | undefined): URL | null {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    return url.protocol === "http:" || url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

export interface WebsiteClassification {
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  whatsappLink: string | null;
  whatsappNumber: string | null;
}

const NONE: WebsiteClassification = { website: null, instagram: null, facebook: null, whatsappLink: null, whatsappNumber: null };

/** Separa o "site" cadastrado em site de verdade, Instagram, Facebook ou link de WhatsApp. */
export function classifyWebsite(raw: string | null | undefined): WebsiteClassification {
  const url = safeUrl(raw);
  if (!url) return NONE;
  const host = url.hostname.toLowerCase();

  if (WA_HOSTS.test(host)) {
    const digits = /(^|\.)wa\.me$/.test(host)
      ? url.pathname.replace(/\D/g, "")
      : (url.searchParams.get("phone")?.replace(/\D/g, "") ?? "");
    return { ...NONE, whatsappLink: url.toString(), whatsappNumber: digits.length >= 8 ? digits : null };
  }
  if (INSTAGRAM_HOSTS.test(host)) return { ...NONE, instagram: url.toString() };
  if (FACEBOOK_HOSTS.test(host)) return { ...NONE, facebook: url.toString() };
  if (OTHER_SOCIAL_HOSTS.test(host)) return NONE;
  return { ...NONE, website: url.toString() };
}

/**
 * O Google não informa se um número tem WhatsApp. A regra é:
 *  - link de WhatsApp publicado pela empresa → confirmado
 *  - celular → provável
 *  - fixo (WhatsApp Business aceita fixo) → possível
 */
export function inferWhatsApp(
  phone: PhoneInfo | null,
  site: { whatsappLink: string | null; whatsappNumber: string | null },
): WhatsAppInfo | null {
  if (site.whatsappLink) {
    return {
      number: site.whatsappNumber ?? (phone ? phone.e164.replace(/\D/g, "") : null),
      link: site.whatsappLink,
      confidence: "confirmado",
      source: "link",
    };
  }
  if (!phone) return null;
  const number = phone.e164.replace(/\D/g, "");
  if (phone.kind === "celular") return { number, link: null, confidence: "provavel", source: "telefone" };
  if (phone.kind === "fixo" || phone.kind === "fixo_ou_celular") {
    return { number, link: null, confidence: "possivel", source: "telefone" };
  }
  return null;
}

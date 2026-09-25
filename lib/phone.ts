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
const SOCIAL_HOSTS = /(^|\.)(instagram\.com|facebook\.com|fb\.com|linktr\.ee|tiktok\.com|linkedin\.com|x\.com|twitter\.com)$/i;

function safeUrl(raw: string | null | undefined): URL | null {
  if (!raw) return null;
  try {
    return new URL(raw);
  } catch {
    return null;
  }
}

/** Separa o "site" do Google em site de verdade, rede social ou link de WhatsApp. */
export function classifyWebsite(raw: string | null | undefined): {
  website: string | null;
  social: string | null;
  whatsappLink: string | null;
  whatsappNumber: string | null;
} {
  const url = safeUrl(raw);
  if (!url) return { website: null, social: null, whatsappLink: null, whatsappNumber: null };
  const host = url.hostname.toLowerCase();

  if (WA_HOSTS.test(host)) {
    let digits: string | null = null;
    if (/(^|\.)wa\.me$/.test(host)) {
      digits = url.pathname.replace(/\D/g, "") || null;
    } else {
      digits = url.searchParams.get("phone")?.replace(/\D/g, "") || null;
    }
    return {
      website: null,
      social: null,
      whatsappLink: url.toString(),
      whatsappNumber: digits && digits.length >= 8 ? digits : null,
    };
  }
  if (SOCIAL_HOSTS.test(host)) {
    return { website: null, social: url.toString(), whatsappLink: null, whatsappNumber: null };
  }
  return { website: url.toString(), social: null, whatsappLink: null, whatsappNumber: null };
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

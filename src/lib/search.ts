import { z } from "zod";

export const CATEGORIES = [
  { id: "restaurante", label: "Restaurante", keyword: "restaurantes" },
  { id: "loja", label: "Loja", keyword: "lojas" },
  { id: "clinica", label: "Clínica", keyword: "clínicas" },
  { id: "academia", label: "Academia", keyword: "academias" },
  { id: "imobiliaria", label: "Imobiliária", keyword: "imobiliárias" },
  { id: "escritorio", label: "Escritório", keyword: "escritórios" },
  { id: "agencia", label: "Agência", keyword: "agências" },
  { id: "hotel", label: "Hotel", keyword: "hotéis" },
  { id: "salao", label: "Salão", keyword: "salões de beleza" },
  { id: "barbearia", label: "Barbearia", keyword: "barbearias" },
  { id: "oficina", label: "Oficina", keyword: "oficinas mecânicas" },
  { id: "comercio", label: "Comércio", keyword: "comércio" },
  { id: "servicos", label: "Serviços", keyword: "prestadores de serviços" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"] | "custom";

export const SEARCH_EXAMPLES = [
  "Restaurantes em Curitiba",
  "Clínicas odontológicas em São Paulo",
  "Barbearias em Miami",
  "Agências imobiliárias em Londres",
  "Empresas sem site em Curitiba",
];

/** Todos os países (ISO 3166-1 alfa-2). Os nomes vêm do Intl.DisplayNames em pt-BR. */
const COUNTRY_CODES =
  "AD AE AF AG AI AL AM AO AR AT AU AW AZ BA BB BD BE BF BG BH BI BJ BM BN BO BR BS BT BW BY BZ CA CD CF CG CH CI CL CM CN CO CR CU CV CY CZ DE DJ DK DM DO DZ EC EE EG ER ES ET FI FJ FM FR GA GB GD GE GH GI GM GN GQ GR GT GW GY HK HN HR HT HU ID IE IL IN IQ IR IS IT JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MG MH MK ML MM MN MO MR MT MU MV MW MX MY MZ NA NE NG NI NL NO NP NR NZ OM PA PE PG PH PK PL PR PS PT PW PY QA RO RS RU RW SA SB SC SD SE SG SI SK SL SM SN SO SR SS ST SV SY SZ TD TG TH TJ TL TM TN TO TR TT TV TW TZ UA UG US UY UZ VA VC VE VN VU WS YE ZA ZM ZW".split(
    " ",
  );

let countryCache: Array<{ code: string; name: string }> | null = null;

export function countries(): Array<{ code: string; name: string }> {
  if (countryCache) return countryCache;
  const names = new Intl.DisplayNames(["pt-BR"], { type: "region" });
  countryCache = COUNTRY_CODES.map((code) => ({ code, name: names.of(code) ?? code })).sort((a, b) =>
    a.name.localeCompare(b.name, "pt-BR"),
  );
  return countryCache;
}

export function countryName(code: string | undefined | null): string | null {
  if (!code) return null;
  try {
    return new Intl.DisplayNames(["pt-BR"], { type: "region" }).of(code.toUpperCase()) ?? null;
  } catch {
    return null;
  }
}

const latLng = z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) });

export const searchParamsSchema = z.object({
  q: z.string().trim().max(160).default(""),
  category: z.string().max(40).optional(),
  customCategory: z.string().trim().max(80).optional(),
  scope: z.enum(["local", "raio", "mundial"]).default("local"),
  country: z.string().trim().length(2).optional(),
  state: z.string().trim().max(80).optional(),
  city: z.string().trim().max(80).optional(),
  neighborhood: z.string().trim().max(80).optional(),
  postalCode: z.string().trim().max(20).optional(),
  radiusKm: z.number().min(0.5).max(50).default(10),
  center: latLng.extend({ label: z.string().max(120).optional() }).optional(),
  /** Ponto de referência para calcular distância (localização atual do usuário). */
  reference: latLng.optional(),
  minRating: z.number().min(0).max(5).optional(),
  openNow: z.boolean().optional(),
  sweep: z.union([z.literal(1), z.literal(2), z.literal(3)]).default(1),
});

export type SearchParams = z.infer<typeof searchParamsSchema>;
export type SearchParamsInput = z.input<typeof searchParamsSchema>;

export function categoryKeyword(params: Pick<SearchParams, "category" | "customCategory">): string | null {
  if (params.category === "custom") return params.customCategory?.trim() || null;
  return CATEGORIES.find((c) => c.id === params.category)?.keyword ?? null;
}

/** "Pinheiros, São Paulo, SP, 05422-000, Brasil" a partir dos campos preenchidos. */
export function locationText(params: SearchParams): string {
  return [params.neighborhood, params.city, params.state, params.postalCode, countryName(params.country)]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(", ");
}

/** O que buscar: texto livre + categoria (sem repetir a categoria se já estiver no texto). */
export function subjectText(params: SearchParams): string {
  const base = params.q.trim();
  const keyword = categoryKeyword(params);
  if (!keyword) return base;
  if (!base) return keyword;
  return base.toLowerCase().includes(keyword.toLowerCase()) ? base : `${keyword} ${base}`;
}

export interface ParsedQuery {
  q: string;
  website?: "com" | "sem";
  whatsapp?: boolean;
  openNow?: boolean;
}

const PHRASES: Array<[RegExp, (p: ParsedQuery) => void]> = [
  [/\b(sem|n[aã]o\s+(?:tem|possui))\s+(web\s*)?site\b/i, (p) => (p.website = "sem")],
  [/\bcom\s+(web\s*)?site\b/i, (p) => (p.website = "com")],
  [/\bcom\s+whats(app)?\b/i, (p) => (p.whatsapp = true)],
  [/\baberto(s|as)?\s+agora\b/i, (p) => (p.openNow = true)],
];

/**
 * Entende pedidos como "Empresas sem site em Curitiba": os filtros viram filtros
 * de verdade e o texto que vai para o Google fica limpo.
 */
export function parseQuery(raw: string): ParsedQuery {
  const parsed: ParsedQuery = { q: raw };
  let text = raw;
  for (const [pattern, apply] of PHRASES) {
    if (pattern.test(text)) {
      apply(parsed);
      text = text.replace(pattern, " ");
    }
  }
  parsed.q = text
    .replace(/\s{2,}/g, " ")
    .replace(/^\s*(empresas|neg[oó]cios)\s+(em|de|no|na)\s+/i, "empresas em ")
    .trim();
  return parsed;
}

export function describeSearch(params: SearchParams): string {
  const subject = subjectText(params) || "Empresas";
  if (params.scope === "mundial") return `${subject} · mundial`;
  if (params.scope === "raio") {
    const where = params.center?.label ?? (locationText(params) || "centro definido");
    return `${subject} · ${params.radiusKm} km de ${where}`;
  }
  const where = locationText(params);
  return where ? `${subject} em ${where}` : subject;
}

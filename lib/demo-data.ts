import { classifyWebsite, inferWhatsApp, parsePhone } from "./phone";
import type { Place, SearchRequest, SearchResponse } from "./types";

/**
 * MODO DEMONSTRAÇÃO — usado só quando não há GOOGLE_MAPS_API_KEY.
 * Todas as empresas abaixo são fictícias, marcadas com `demo: true`,
 * e os botões de contato ficam bloqueados na interface.
 */

const DEFAULT_CENTER = { lat: -23.5614, lng: -46.6559 }; // Av. Paulista, São Paulo

const SUFFIXES = [
  "Centro",
  "Vila Nova",
  "Jardins",
  "Bela Vista",
  "da Praça",
  "Express",
  "Prime",
  "do Bairro",
  "Estação",
  "Família",
  "Norte",
  "Sul",
  "Premium",
  "Avenida",
  "Parque",
  "Mooca",
  "Pinheiros",
  "Vila Madalena",
  "Consolação",
  "Liberdade",
];

const STREETS = ["Rua Augusta", "Av. Paulista", "Rua da Consolação", "Rua Haddock Lobo", "Alameda Santos", "Rua Frei Caneca"];

export function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32: gerador determinístico com boa dispersão. */
export function random(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** "Barbearias em SP" → "Barbearia": singulariza a primeira palavra para nomes mais naturais. */
function label(query: string): string {
  const words = query.trim().split(/\s+/).slice(0, 3);
  if (!words.length || !words[0]) return "Empresa";
  if (words[0].length > 4 && /[aeo]s$/i.test(words[0])) words[0] = words[0].slice(0, -1);
  const clean = words.join(" ");
  return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
}

function buildPlace(query: string, location: string, index: number, center: { lat: number; lng: number }): Place {
  const rnd = random(hash(`${query}|${location}|${index}`));
  const base = label(query);
  const suffix = SUFFIXES[index % SUFFIXES.length]!;
  const mobile = rnd() > 0.35;
  const tail = String(1000 + index * 37).slice(-4);
  const international = mobile ? `+55 11 90000-${tail}` : `+55 11 3000-${tail}`;
  const roll = rnd();
  const websiteRaw =
    roll < 0.35 ? null : roll < 0.5 ? `https://wa.me/55119000${tail}0` : `https://example.com/${index + 1}`;
  const site = classifyWebsite(websiteRaw);
  const phone = rnd() > 0.08 ? parsePhone(international, null, "BR") : null;
  const street = STREETS[index % STREETS.length]!;

  return {
    id: `demo-${hash(`${query}|${location}`)}-${index}`,
    name: `${base} ${suffix}`,
    category: base,
    address: `${street}, ${100 + Math.floor(rnd() * 1900)} — ${location || "São Paulo"} (endereço fictício)`,
    city: location || "São Paulo",
    location: {
      lat: center.lat + (rnd() - 0.5) * 0.06,
      lng: center.lng + (rnd() - 0.5) * 0.06,
    },
    rating: Math.round((3.4 + rnd() * 1.6) * 10) / 10,
    reviewCount: Math.floor(rnd() * rnd() * 1200) + 3,
    phone,
    whatsapp: inferWhatsApp(phone, site),
    website: site.website,
    social: site.social,
    mapsUrl: null,
    openNow: rnd() > 0.3,
    status: "OPERATIONAL",
    priceLevel: Math.floor(rnd() * 4) + 1,
    demo: true,
  };
}

export function demoSearch(request: SearchRequest): SearchResponse {
  const page = request.pageToken === "demo-2" ? 2 : request.pageToken === "demo-3" ? 3 : 1;
  const center = request.near ? { lat: request.near.lat, lng: request.near.lng } : DEFAULT_CENTER;
  const location = request.location?.trim() ?? "";
  const perPage = page === 3 ? 8 : 20;
  const start = (page - 1) * 20;

  let places = Array.from({ length: perPage }, (_, i) => buildPlace(request.query, location, start + i, center));
  if (request.minRating) places = places.filter((place) => (place.rating ?? 0) >= request.minRating!);
  if (request.openNow) places = places.filter((place) => place.openNow);

  return { places, nextPageToken: page < 3 ? `demo-${page + 1}` : null, demo: true };
}

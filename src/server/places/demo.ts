import "server-only";
import { boundingBox, type Rect } from "@/lib/geo";
import { classifyWebsite, inferWhatsApp, parsePhone } from "@/lib/phone";
import type { Enrichment, LatLng, Place, PlaceDetails } from "@/lib/types";
import { PlacesError, type GeoArea, type PlacesProvider, type ProviderSearchRequest } from "./provider";

/**
 * MODO DEMONSTRAÇÃO — usado só quando GOOGLE_MAPS_API_KEY não está configurada.
 * Todas as empresas são fictícias, têm `demo: true` e a interface bloqueia contato.
 */

const KNOWN: Record<string, [number, number, string]> = {
  "sao paulo": [-23.5505, -46.6333, "São Paulo, SP, Brasil"],
  "rio de janeiro": [-22.9068, -43.1729, "Rio de Janeiro, RJ, Brasil"],
  curitiba: [-25.4284, -49.2733, "Curitiba, PR, Brasil"],
  "belo horizonte": [-19.9167, -43.9345, "Belo Horizonte, MG, Brasil"],
  "porto alegre": [-30.0346, -51.2177, "Porto Alegre, RS, Brasil"],
  florianopolis: [-27.5954, -48.548, "Florianópolis, SC, Brasil"],
  recife: [-8.0476, -34.877, "Recife, PE, Brasil"],
  salvador: [-12.9777, -38.5016, "Salvador, BA, Brasil"],
  brasilia: [-15.7939, -47.8828, "Brasília, DF, Brasil"],
  fortaleza: [-3.7319, -38.5267, "Fortaleza, CE, Brasil"],
  joinville: [-26.3045, -48.8487, "Joinville, SC, Brasil"],
  lisboa: [38.7223, -9.1393, "Lisboa, Portugal"],
  porto: [41.1579, -8.6291, "Porto, Portugal"],
  miami: [25.7617, -80.1918, "Miami, FL, EUA"],
  "nova york": [40.7128, -74.006, "Nova York, NY, EUA"],
  londres: [51.5072, -0.1276, "Londres, Reino Unido"],
  madri: [40.4168, -3.7038, "Madri, Espanha"],
  paris: [48.8566, 2.3522, "Paris, França"],
  "buenos aires": [-34.6037, -58.3816, "Buenos Aires, Argentina"],
  toronto: [43.6532, -79.3832, "Toronto, Canadá"],
};

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
  "Horizonte",
  "Aurora",
  "Central",
  "Nova Era",
  "Boulevard",
];

const STREETS = ["Rua das Flores", "Avenida Central", "Rua do Comércio", "Alameda dos Ipês", "Rua Sete de Setembro", "Avenida Brasil"];

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

function normalize(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

function knownArea(text: string): GeoArea | null {
  const norm = normalize(text);
  for (const [key, [lat, lng, label]] of Object.entries(KNOWN)) {
    if (norm.includes(key)) return { label, center: { lat, lng }, viewport: boundingBox({ lat, lng }, 8) };
  }
  return null;
}

function subject(textQuery: string): string {
  const [what] = textQuery.split(/\s+em\s+/i);
  const words = (what ?? "").trim().split(/\s+/).slice(0, 3);
  if (!words[0] || /^empresas?$/i.test(words[0])) return "Empresa";
  if (words[0].length > 4 && /[aeo]s$/i.test(words[0])) words[0] = words[0].slice(0, -1);
  const clean = words.join(" ").replace(/õe$/i, "ão").replace(/éis$/i, "el");
  return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
}

interface DemoSeed {
  q: string;
  i: number;
  lat: number;
  lng: number;
  city: string;
}

function encodeId(seed: DemoSeed): string {
  return `demo_${Buffer.from(JSON.stringify(seed)).toString("base64url")}`;
}

function decodeId(id: string): DemoSeed | null {
  if (!id.startsWith("demo_")) return null;
  try {
    return JSON.parse(Buffer.from(id.slice(5), "base64url").toString("utf8")) as DemoSeed;
  } catch {
    return null;
  }
}

const WEEK = ["segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado", "domingo"];

function buildPlace(seed: DemoSeed): Place {
  const rnd = random(hash(`${seed.q}|${seed.city}|${seed.i}`));
  const base = subject(seed.q);
  const name = `${base} ${SUFFIXES[seed.i % SUFFIXES.length]}${seed.i >= SUFFIXES.length ? ` ${Math.floor(seed.i / SUFFIXES.length) + 1}` : ""}`;
  const tail = String(1000 + ((seed.i * 37) % 9000)).padStart(4, "0");
  const mobile = rnd() > 0.35;
  const phone = rnd() > 0.1 ? parsePhone(mobile ? `+55 11 90000-${tail}` : `+55 11 3000-${tail}`, null, "BR") : null;
  const roll = rnd();
  const slug = normalize(name).replace(/[^a-z0-9]+/g, "");
  const websiteRaw =
    roll < 0.3
      ? null
      : roll < 0.42
        ? `https://instagram.com/${slug}.demo`
        : roll < 0.52
          ? `https://wa.me/551190000${tail}`
          : `https://example.com/${slug}`;
  const site = classifyWebsite(websiteRaw);
  const hasReviews = rnd() > 0.08;
  const opensAt = 7 + Math.floor(rnd() * 3);
  const closesAt = 17 + Math.floor(rnd() * 5);
  const street = STREETS[seed.i % STREETS.length]!;

  return {
    id: encodeId(seed),
    name,
    category: base,
    types: [],
    address: `${street}, ${100 + Math.floor(rnd() * 1900)} — ${seed.city} (endereço fictício)`,
    neighborhood: SUFFIXES[(seed.i + 3) % SUFFIXES.length]!,
    city: seed.city.split(",")[0] ?? seed.city,
    state: null,
    country: "Brasil",
    postalCode: null,
    location: { lat: seed.lat, lng: seed.lng },
    rating: hasReviews ? Math.round((3.3 + rnd() * 1.7) * 10) / 10 : null,
    reviewCount: hasReviews ? Math.floor(rnd() * rnd() * 900) + 4 : null,
    phone,
    whatsapp: inferWhatsApp(phone, site),
    website: site.website,
    instagram: site.instagram,
    facebook: site.facebook,
    mapsUrl: null,
    openNow: rnd() > 0.3,
    hours: WEEK.map((day, d) => (d === 6 ? `${day}: Fechado` : `${day}: ${opensAt}:00–${d === 5 ? 13 : closesAt}:00`)),
    status: rnd() > 0.03 ? "OPERATIONAL" : "CLOSED_TEMPORARILY",
    priceLevel: Math.floor(rnd() * 3) + 1,
    photos: [],
    demo: true,
  };
}

function areaFor(request: ProviderSearchRequest): { rect: Rect; label: string } {
  if (request.restriction) return { rect: request.restriction, label: "área selecionada" };
  if (request.bias) return { rect: boundingBox(request.bias.center, Math.min(request.bias.radiusKm, 6)), label: "sua região" };
  const known = knownArea(request.textQuery.split(/\s+em\s+/i)[1] ?? request.textQuery);
  if (known) return { rect: known.viewport!, label: known.label };
  const center: LatLng = { lat: -23.5505, lng: -46.6333 };
  return { rect: boundingBox(center, 6), label: "São Paulo, SP, Brasil" };
}

export function demoEnrichment(place: Place): Enrichment | null {
  if (!place.website) return null;
  const rnd = random(hash(place.id));
  const domain = "example.com";
  return {
    url: place.website,
    ok: true,
    emails: rnd() > 0.35 ? [`contato+${hash(place.id) % 1000}@${domain}`] : [],
    instagram: rnd() > 0.5 ? `https://instagram.com/${normalize(place.name).replace(/[^a-z0-9]+/g, "")}.demo` : null,
    facebook: rnd() > 0.6 ? `https://facebook.com/${normalize(place.name).replace(/[^a-z0-9]+/g, "")}.demo` : null,
    linkedin: null,
    whatsapp: null,
    fetchedAt: new Date().toISOString(),
    demo: true,
  };
}

export function createDemoProvider(): PlacesProvider {
  return {
    id: "demo",

    async search(request) {
      const page = Number(request.pageToken?.replace("demo:", "") || 1);
      const { rect, label } = areaFor(request);
      const count = page === 3 ? 12 : 20;
      const start = (page - 1) * 20;
      const areaSeed = `${request.textQuery}|${rect.low.lat.toFixed(3)}|${rect.low.lng.toFixed(3)}`;
      let places = Array.from({ length: count }, (_, k) => {
        const i = start + k;
        const rnd = random(hash(`${areaSeed}|pos|${i}`));
        return buildPlace({
          q: request.textQuery,
          i,
          lat: rect.low.lat + rnd() * (rect.high.lat - rect.low.lat),
          lng: rect.low.lng + rnd() * (rect.high.lng - rect.low.lng),
          city: label,
        });
      });
      if (request.minRating) places = places.filter((p) => (p.rating ?? 0) >= request.minRating!);
      if (request.openNow) places = places.filter((p) => p.openNow);
      return { places, nextPageToken: page < 3 ? `demo:${page + 1}` : null };
    },

    async details(placeId) {
      const seed = decodeId(placeId);
      if (!seed) throw new PlacesError("Empresa de demonstração inválida.", 404);
      const place = buildPlace(seed);
      const reviews: PlaceDetails["reviews"] = place.reviewCount
        ? [
            "Atendimento rápido e educado. Voltarei com certeza.",
            "Bom custo-benefício, mas o horário de pico é cheio.",
            "Equipe atenciosa e ambiente organizado.",
          ].map((text, i) => ({ author: `Cliente exemplo ${i + 1}`, authorUri: null, rating: 5 - (i % 2), text, when: `há ${i + 1} semana${i ? "s" : ""}` }))
        : [];
      return { ...place, reviews, summary: "Empresa fictícia do modo demonstração." };
    },

    async geocode(text) {
      const known = knownArea(text);
      if (known) return known;
      const rnd = random(hash(normalize(text)));
      const center = { lat: -23.5505 + (rnd() - 0.5) * 0.4, lng: -46.6333 + (rnd() - 0.5) * 0.4 };
      return { label: `${text} (posição fictícia)`, center, viewport: boundingBox(center, 6) };
    },

    async photoUri() {
      return null;
    },
  };
}

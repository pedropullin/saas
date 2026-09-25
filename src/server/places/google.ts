import "server-only";
import { classifyWebsite, inferWhatsApp, parsePhone } from "@/lib/phone";
import type { BusinessStatus, Place, PlaceDetails, PlacePhoto, Review } from "@/lib/types";
import { PlacesError, type GeoArea, type PlacesProvider, type ProviderSearchRequest, type ProviderSearchResult } from "./provider";

const API = "https://places.googleapis.com/v1";
const LANGUAGE = "pt-BR";

const PLACE_FIELDS = [
  "id",
  "displayName",
  "formattedAddress",
  "addressComponents",
  "location",
  "rating",
  "userRatingCount",
  "nationalPhoneNumber",
  "internationalPhoneNumber",
  "websiteUri",
  "googleMapsUri",
  "businessStatus",
  "priceLevel",
  "primaryTypeDisplayName",
  "types",
  "currentOpeningHours",
  "photos",
];

export const SEARCH_FIELD_MASK = [...PLACE_FIELDS.map((f) => `places.${f}`), "nextPageToken"].join(",");
export const DETAILS_FIELD_MASK = [...PLACE_FIELDS, "regularOpeningHours", "reviews", "editorialSummary"].join(",");
const GEOCODE_FIELD_MASK = "places.displayName,places.formattedAddress,places.location,places.viewport";

const PRICE_LEVELS: Record<string, number> = {
  PRICE_LEVEL_FREE: 0,
  PRICE_LEVEL_INEXPENSIVE: 1,
  PRICE_LEVEL_MODERATE: 2,
  PRICE_LEVEL_EXPENSIVE: 3,
  PRICE_LEVEL_VERY_EXPENSIVE: 4,
};

interface LocalizedText {
  text?: string;
}

interface GoogleLatLng {
  latitude: number;
  longitude: number;
}

export interface GooglePlace {
  id: string;
  displayName?: LocalizedText;
  formattedAddress?: string;
  addressComponents?: Array<{ longText?: string; shortText?: string; types?: string[] }>;
  location?: GoogleLatLng;
  viewport?: { low: GoogleLatLng; high: GoogleLatLng };
  rating?: number;
  userRatingCount?: number;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  websiteUri?: string;
  googleMapsUri?: string;
  businessStatus?: string;
  priceLevel?: string;
  primaryTypeDisplayName?: LocalizedText;
  types?: string[];
  currentOpeningHours?: { openNow?: boolean; weekdayDescriptions?: string[] };
  regularOpeningHours?: { weekdayDescriptions?: string[] };
  editorialSummary?: LocalizedText;
  photos?: Array<{
    name: string;
    widthPx?: number;
    heightPx?: number;
    authorAttributions?: Array<{ displayName?: string; uri?: string }>;
  }>;
  reviews?: Array<{
    rating?: number;
    text?: LocalizedText;
    originalText?: LocalizedText;
    relativePublishTimeDescription?: string;
    authorAttribution?: { displayName?: string; uri?: string };
  }>;
}

function component(place: GooglePlace, types: string[], short = false): string | null {
  for (const type of types) {
    const found = place.addressComponents?.find((item) => item.types?.includes(type));
    if (found) return (short ? found.shortText : found.longText) ?? null;
  }
  return null;
}

function mapPhotos(raw: GooglePlace["photos"]): PlacePhoto[] {
  return (raw ?? []).slice(0, 10).map((photo) => ({
    name: photo.name,
    width: photo.widthPx ?? null,
    height: photo.heightPx ?? null,
    attributions: (photo.authorAttributions ?? []).map((a) => ({ name: a.displayName ?? "Google", uri: a.uri ?? null })),
  }));
}

export function mapPlace(raw: GooglePlace): Place {
  const countryCode = component(raw, ["country"], true);
  const phone = parsePhone(raw.internationalPhoneNumber, raw.nationalPhoneNumber, countryCode);
  const site = classifyWebsite(raw.websiteUri);
  const status = raw.businessStatus as BusinessStatus | undefined;

  return {
    id: raw.id,
    name: raw.displayName?.text ?? "Nome não encontrado",
    category: raw.primaryTypeDisplayName?.text ?? null,
    types: raw.types ?? [],
    address: raw.formattedAddress ?? null,
    neighborhood: component(raw, ["sublocality_level_1", "neighborhood", "sublocality"]),
    city: component(raw, ["locality", "administrative_area_level_2", "postal_town"]),
    state: component(raw, ["administrative_area_level_1"], true),
    country: component(raw, ["country"]),
    postalCode: component(raw, ["postal_code"]),
    location: raw.location ? { lat: raw.location.latitude, lng: raw.location.longitude } : null,
    rating: typeof raw.rating === "number" ? raw.rating : null,
    reviewCount: typeof raw.userRatingCount === "number" ? raw.userRatingCount : null,
    phone,
    whatsapp: inferWhatsApp(phone, site),
    website: site.website,
    instagram: site.instagram,
    facebook: site.facebook,
    mapsUrl: raw.googleMapsUri ?? null,
    openNow: typeof raw.currentOpeningHours?.openNow === "boolean" ? raw.currentOpeningHours.openNow : null,
    hours: raw.currentOpeningHours?.weekdayDescriptions ?? raw.regularOpeningHours?.weekdayDescriptions ?? [],
    status: status && ["OPERATIONAL", "CLOSED_TEMPORARILY", "CLOSED_PERMANENTLY"].includes(status) ? status : null,
    priceLevel: raw.priceLevel && raw.priceLevel in PRICE_LEVELS ? PRICE_LEVELS[raw.priceLevel]! : null,
    photos: mapPhotos(raw.photos),
  };
}

export function mapDetails(raw: GooglePlace): PlaceDetails {
  const reviews: Review[] = (raw.reviews ?? [])
    .map((review) => ({
      author: review.authorAttribution?.displayName ?? "Usuário do Google",
      authorUri: review.authorAttribution?.uri ?? null,
      rating: review.rating ?? 0,
      text: review.text?.text ?? review.originalText?.text ?? "",
      when: review.relativePublishTimeDescription ?? "",
    }))
    .filter((review) => review.text || review.rating);
  const place = mapPlace(raw);
  return {
    ...place,
    hours: raw.regularOpeningHours?.weekdayDescriptions ?? place.hours,
    reviews,
    summary: raw.editorialSummary?.text ?? null,
  };
}

async function call(url: string, init: RequestInit, fieldMask: string | null, apiKey: string): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        ...(fieldMask ? { "X-Goog-FieldMask": fieldMask } : {}),
      },
    });
  } catch {
    throw new PlacesError("Não foi possível falar com o Google Maps. Tente de novo em instantes.", 502);
  }

  const data = (await response.json().catch(() => null)) as {
    error?: { message?: string; status?: string; details?: Array<{ reason?: string }> };
  } | null;
  if (response.ok) return data;

  const status = data?.error?.status;
  const reasons = (data?.error?.details ?? []).map((detail) => detail.reason);
  if (reasons.includes("API_KEY_INVALID")) throw new PlacesError("A chave do Google é inválida. Confira GOOGLE_MAPS_API_KEY.", 502);
  if (reasons.includes("SERVICE_DISABLED") || reasons.includes("API_KEY_SERVICE_BLOCKED")) {
    throw new PlacesError("A “Places API (New)” não está ativada para esta chave. Ative-a no Google Cloud.", 502);
  }
  if (response.status === 403 || status === "PERMISSION_DENIED") {
    throw new PlacesError("A chave do Google recusou a busca. Confira as permissões da chave no Google Cloud.", 502);
  }
  if (response.status === 429 || status === "RESOURCE_EXHAUSTED") {
    throw new PlacesError("Limite de consultas do Google atingido. Aguarde ou aumente a cota no Google Cloud.", 429);
  }
  if (response.status === 404) throw new PlacesError("Empresa não encontrada no Google Maps.", 404);
  throw new PlacesError(data?.error?.message ?? "O Google Maps retornou um erro inesperado.", 502);
}

const toGoogle = (point: { lat: number; lng: number }) => ({ latitude: point.lat, longitude: point.lng });

export function buildSearchBody(request: ProviderSearchRequest): Record<string, unknown> {
  const body: Record<string, unknown> = { textQuery: request.textQuery, languageCode: LANGUAGE, pageSize: 20 };
  if (request.pageToken) body.pageToken = request.pageToken;
  if (request.restriction) {
    body.locationRestriction = { rectangle: { low: toGoogle(request.restriction.low), high: toGoogle(request.restriction.high) } };
  } else if (request.bias) {
    body.locationBias = {
      circle: { center: toGoogle(request.bias.center), radius: Math.min(Math.max(request.bias.radiusKm, 0.5), 50) * 1000 },
    };
  }
  if (request.regionCode) body.regionCode = request.regionCode.toLowerCase();
  if (request.minRating) body.minRating = Math.floor(request.minRating * 2) / 2;
  if (request.openNow) body.openNow = true;
  return body;
}

/** Detalhes consultados há pouco ficam em memória por 10 minutos (evita cobrança repetida). */
const detailsMemo = new Map<string, { at: number; value: PlaceDetails }>();

export function createGoogleProvider(apiKey: string): PlacesProvider {
  return {
    id: "google",

    async search(request): Promise<ProviderSearchResult> {
      const data = (await call(
        `${API}/places:searchText`,
        { method: "POST", body: JSON.stringify(buildSearchBody(request)) },
        SEARCH_FIELD_MASK,
        apiKey,
      )) as { places?: GooglePlace[]; nextPageToken?: string } | null;
      return { places: (data?.places ?? []).map(mapPlace), nextPageToken: data?.nextPageToken ?? null };
    },

    async details(placeId): Promise<PlaceDetails> {
      const memo = detailsMemo.get(placeId);
      if (memo && Date.now() - memo.at < 10 * 60_000) return memo.value;
      const data = (await call(
        `${API}/places/${encodeURIComponent(placeId)}?languageCode=${LANGUAGE}`,
        { method: "GET" },
        DETAILS_FIELD_MASK,
        apiKey,
      )) as GooglePlace;
      const value = mapDetails(data);
      detailsMemo.set(placeId, { at: Date.now(), value });
      if (detailsMemo.size > 500) detailsMemo.delete(detailsMemo.keys().next().value!);
      return value;
    },

    async geocode(text): Promise<GeoArea | null> {
      const data = (await call(
        `${API}/places:searchText`,
        { method: "POST", body: JSON.stringify({ textQuery: text, languageCode: LANGUAGE, pageSize: 1 }) },
        GEOCODE_FIELD_MASK,
        apiKey,
      )) as { places?: GooglePlace[] } | null;
      const first = data?.places?.[0];
      if (!first?.location) return null;
      return {
        label: first.formattedAddress ?? first.displayName?.text ?? text,
        center: { lat: first.location.latitude, lng: first.location.longitude },
        viewport: first.viewport
          ? {
              low: { lat: first.viewport.low.latitude, lng: first.viewport.low.longitude },
              high: { lat: first.viewport.high.latitude, lng: first.viewport.high.longitude },
            }
          : null,
      };
    },

    async photoUri(photoName, maxWidth): Promise<string | null> {
      const data = (await call(
        `${API}/${photoName}/media?maxWidthPx=${Math.min(Math.max(maxWidth, 64), 1600)}&skipHttpRedirect=true`,
        { method: "GET" },
        null,
        apiKey,
      )) as { photoUri?: string } | null;
      return data?.photoUri ?? null;
    },
  };
}

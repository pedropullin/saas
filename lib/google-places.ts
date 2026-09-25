import { classifyWebsite, inferWhatsApp, parsePhone } from "./phone";
import type { BusinessStatus, Place, PlaceDetails, Review, SearchRequest, SearchResponse } from "./types";

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
  "currentOpeningHours",
];

const SEARCH_FIELD_MASK = [...PLACE_FIELDS.map((field) => `places.${field}`), "nextPageToken"].join(",");
const DETAILS_FIELD_MASK = [...PLACE_FIELDS, "regularOpeningHours", "reviews", "editorialSummary"].join(",");

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

interface GoogleAddressComponent {
  longText?: string;
  shortText?: string;
  types?: string[];
}

export interface GooglePlace {
  id: string;
  displayName?: LocalizedText;
  formattedAddress?: string;
  addressComponents?: GoogleAddressComponent[];
  location?: { latitude: number; longitude: number };
  rating?: number;
  userRatingCount?: number;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  websiteUri?: string;
  googleMapsUri?: string;
  businessStatus?: string;
  priceLevel?: string;
  primaryTypeDisplayName?: LocalizedText;
  currentOpeningHours?: { openNow?: boolean; weekdayDescriptions?: string[] };
  regularOpeningHours?: { weekdayDescriptions?: string[] };
  editorialSummary?: LocalizedText;
  reviews?: Array<{
    rating?: number;
    text?: LocalizedText;
    originalText?: LocalizedText;
    relativePublishTimeDescription?: string;
    authorAttribution?: { displayName?: string };
  }>;
}

export class PlacesError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

function component(place: GooglePlace, type: string, short = false): string | null {
  const found = place.addressComponents?.find((item) => item.types?.includes(type));
  if (!found) return null;
  return (short ? found.shortText : found.longText) ?? null;
}

export function mapPlace(raw: GooglePlace): Place {
  const country = component(raw, "country", true);
  const phone = parsePhone(raw.internationalPhoneNumber, raw.nationalPhoneNumber, country);
  const site = classifyWebsite(raw.websiteUri);
  const status = raw.businessStatus as BusinessStatus | undefined;

  return {
    id: raw.id,
    name: raw.displayName?.text ?? "Sem nome",
    category: raw.primaryTypeDisplayName?.text ?? null,
    address: raw.formattedAddress ?? null,
    city:
      component(raw, "locality") ??
      component(raw, "administrative_area_level_2") ??
      component(raw, "administrative_area_level_1"),
    location: raw.location ? { lat: raw.location.latitude, lng: raw.location.longitude } : null,
    rating: typeof raw.rating === "number" ? raw.rating : null,
    reviewCount: raw.userRatingCount ?? 0,
    phone,
    whatsapp: inferWhatsApp(phone, site),
    website: site.website,
    social: site.social,
    mapsUrl: raw.googleMapsUri ?? null,
    openNow: typeof raw.currentOpeningHours?.openNow === "boolean" ? raw.currentOpeningHours.openNow : null,
    status: status && ["OPERATIONAL", "CLOSED_TEMPORARILY", "CLOSED_PERMANENTLY"].includes(status) ? status : null,
    priceLevel: raw.priceLevel && raw.priceLevel in PRICE_LEVELS ? PRICE_LEVELS[raw.priceLevel]! : null,
  };
}

export function mapDetails(raw: GooglePlace): PlaceDetails {
  const reviews: Review[] = (raw.reviews ?? [])
    .map((review) => ({
      author: review.authorAttribution?.displayName ?? "Usuário do Google",
      rating: review.rating ?? 0,
      text: review.text?.text ?? review.originalText?.text ?? "",
      when: review.relativePublishTimeDescription ?? "",
    }))
    .filter((review) => review.text || review.rating);

  return {
    ...mapPlace(raw),
    hours: raw.regularOpeningHours?.weekdayDescriptions ?? raw.currentOpeningHours?.weekdayDescriptions ?? [],
    reviews,
    summary: raw.editorialSummary?.text ?? null,
  };
}

export function buildTextQuery(query: string, location?: string): string {
  const what = query.trim();
  const where = location?.trim();
  return where ? `${what} em ${where}` : what;
}

async function googleFetch(url: string, init: RequestInit, fieldMask: string, apiKey: string): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": fieldMask,
        ...init.headers,
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
  if (reasons.includes("API_KEY_INVALID")) {
    throw new PlacesError("A chave do Google é inválida. Confira o valor de GOOGLE_MAPS_API_KEY.", 502);
  }
  if (reasons.includes("SERVICE_DISABLED") || reasons.includes("API_KEY_SERVICE_BLOCKED")) {
    throw new PlacesError(
      "A “Places API (New)” não está ativada para esta chave. Ative-a no Google Cloud e tente de novo.",
      502,
    );
  }
  if (response.status === 403 || status === "PERMISSION_DENIED") {
    throw new PlacesError(
      "A chave do Google recusou a busca. Confira se a “Places API (New)” está ativada e se a chave tem permissão para ela.",
      502,
    );
  }
  if (response.status === 429 || status === "RESOURCE_EXHAUSTED") {
    throw new PlacesError("Limite de buscas do Google atingido. Espere um pouco ou aumente a cota no Google Cloud.", 429);
  }
  if (response.status === 404) throw new PlacesError("Empresa não encontrada no Google Maps.", 404);
  throw new PlacesError(data?.error?.message ?? "O Google Maps retornou um erro inesperado.", 502);
}

export async function searchPlaces(request: SearchRequest, apiKey: string): Promise<SearchResponse> {
  const body: Record<string, unknown> = {
    textQuery: buildTextQuery(request.query, request.location),
    languageCode: LANGUAGE,
    pageSize: 20,
  };
  if (request.pageToken) body.pageToken = request.pageToken;
  if (request.near) {
    body.locationBias = {
      circle: {
        center: { latitude: request.near.lat, longitude: request.near.lng },
        radius: Math.min(Math.max(request.near.radiusKm, 0.5), 50) * 1000,
      },
    };
  }
  if (request.minRating) body.minRating = request.minRating;
  if (request.openNow) body.openNow = true;

  const data = (await googleFetch(
    `${API}/places:searchText`,
    { method: "POST", body: JSON.stringify(body) },
    SEARCH_FIELD_MASK,
    apiKey,
  )) as { places?: GooglePlace[]; nextPageToken?: string } | null;

  return {
    places: (data?.places ?? []).map(mapPlace),
    nextPageToken: data?.nextPageToken ?? null,
    demo: false,
  };
}

export async function getPlaceDetails(id: string, apiKey: string): Promise<PlaceDetails> {
  const data = (await googleFetch(
    `${API}/places/${encodeURIComponent(id)}?languageCode=${LANGUAGE}`,
    { method: "GET" },
    DETAILS_FIELD_MASK,
    apiKey,
  )) as GooglePlace;
  return mapDetails(data);
}

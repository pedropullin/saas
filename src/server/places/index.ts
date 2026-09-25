import "server-only";
import { createDemoProvider } from "./demo";
import { createGoogleProvider } from "./google";
import type { PlacesProvider } from "./provider";

let cached: { key: string; provider: PlacesProvider } | null = null;

/** Google Places quando há chave; senão, demonstração claramente marcada. */
export function getPlacesProvider(): PlacesProvider {
  const key = process.env.GOOGLE_MAPS_API_KEY?.trim() ?? "";
  if (cached?.key === key) return cached.provider;
  const provider = key ? createGoogleProvider(key) : createDemoProvider();
  cached = { key, provider };
  return provider;
}

export function isDemoMode(): boolean {
  return !process.env.GOOGLE_MAPS_API_KEY?.trim();
}

export function isValidPlaceId(id: string): boolean {
  return /^[A-Za-z0-9_-]{8,600}$/.test(id);
}

export { PlacesError } from "./provider";
export type { GeoArea, PlacesProvider, ProviderSearchRequest } from "./provider";

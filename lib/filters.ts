import type { Place } from "./types";

export type WebsiteFilter = "todos" | "sem" | "com";
export type SortKey = "relevancia" | "nota" | "avaliacoes" | "nome";

export interface ClientFilters {
  minRating: number;
  minReviews: number;
  onlyWithPhone: boolean;
  onlyWhatsApp: boolean;
  website: WebsiteFilter;
  openNow: boolean;
  hideClosed: boolean;
}

export const DEFAULT_FILTERS: ClientFilters = {
  minRating: 0,
  minReviews: 0,
  onlyWithPhone: false,
  onlyWhatsApp: false,
  website: "todos",
  openNow: false,
  hideClosed: true,
};

export function applyFilters(places: Place[], filters: ClientFilters, sort: SortKey): Place[] {
  const filtered = places.filter((place) => {
    if (filters.minRating && (place.rating ?? 0) < filters.minRating) return false;
    if (filters.minReviews && place.reviewCount < filters.minReviews) return false;
    if (filters.onlyWithPhone && !place.phone && !place.whatsapp) return false;
    if (filters.onlyWhatsApp && !(place.whatsapp && place.whatsapp.confidence !== "possivel")) return false;
    if (filters.website === "sem" && place.website) return false;
    if (filters.website === "com" && !place.website) return false;
    if (filters.openNow && place.openNow !== true) return false;
    if (filters.hideClosed && place.status === "CLOSED_PERMANENTLY") return false;
    return true;
  });

  if (sort === "relevancia") return filtered;
  const sorted = [...filtered];
  if (sort === "nota") sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || b.reviewCount - a.reviewCount);
  if (sort === "avaliacoes") sorted.sort((a, b) => b.reviewCount - a.reviewCount);
  if (sort === "nome") sorted.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  return sorted;
}

export function activeFilterCount(filters: ClientFilters): number {
  let count = 0;
  if (filters.minRating) count++;
  if (filters.minReviews) count++;
  if (filters.onlyWithPhone) count++;
  if (filters.onlyWhatsApp) count++;
  if (filters.website !== "todos") count++;
  if (filters.openNow) count++;
  if (!filters.hideClosed) count++;
  return count;
}

/** Junta resultados de várias páginas/regiões sem duplicar empresas. */
export function mergePlaces(current: Place[], incoming: Place[]): Place[] {
  const seen = new Set(current.map((place) => place.id));
  const merged = [...current];
  for (const place of incoming) {
    if (seen.has(place.id)) continue;
    seen.add(place.id);
    merged.push(place);
  }
  return merged;
}

/** "Pinheiros, SP; Moema, SP" → duas regiões. Vírgula continua valendo dentro do endereço. */
export function splitLocations(raw: string): string[] {
  return raw
    .split(/[;\n|]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 10);
}

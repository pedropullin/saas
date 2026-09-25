import { contactFacts, hasFact } from "./contact";
import type { ResultPlace } from "./types";

export type Tri = "todos" | "com" | "sem";
export type SortKey = "relevancia" | "avaliacoes" | "nota" | "distancia";

export interface ResultFilters {
  website: Tri;
  whatsapp: boolean;
  phone: boolean;
  instagram: boolean;
  facebook: boolean;
  email: boolean;
  openNow: boolean;
  minRating: number;
  maxRating: number;
  minReviews: number;
  hideClosed: boolean;
}

export const DEFAULT_FILTERS: ResultFilters = {
  website: "todos",
  whatsapp: false,
  phone: false,
  instagram: false,
  facebook: false,
  email: false,
  openNow: false,
  minRating: 0,
  maxRating: 5,
  minReviews: 0,
  hideClosed: true,
};

export function applyFilters(places: ResultPlace[], filters: ResultFilters, sort: SortKey): ResultPlace[] {
  const list = places.filter((place) => {
    const facts = contactFacts(place, place.enrichment);
    if (filters.website === "com" && !hasFact(facts.website)) return false;
    if (filters.website === "sem" && hasFact(facts.website)) return false;
    if (filters.whatsapp && !(hasFact(facts.whatsapp) && facts.whatsapp.value.confidence !== "possivel")) return false;
    if (filters.phone && !hasFact(facts.phone)) return false;
    if (filters.instagram && !hasFact(facts.instagram)) return false;
    if (filters.facebook && !hasFact(facts.facebook)) return false;
    if (filters.email && !hasFact(facts.email)) return false;
    if (filters.openNow && place.openNow !== true) return false;
    if (filters.minRating > 0 && (place.rating ?? 0) < filters.minRating) return false;
    if (filters.maxRating < 5 && (place.rating == null || place.rating > filters.maxRating)) return false;
    if (filters.minReviews > 0 && (place.reviewCount ?? 0) < filters.minReviews) return false;
    if (filters.hideClosed && place.status === "CLOSED_PERMANENTLY") return false;
    return true;
  });

  if (sort === "relevancia") return list;
  const sorted = [...list];
  if (sort === "avaliacoes") sorted.sort((a, b) => (b.reviewCount ?? -1) - (a.reviewCount ?? -1));
  if (sort === "nota") sorted.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1) || (b.reviewCount ?? 0) - (a.reviewCount ?? 0));
  if (sort === "distancia") sorted.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
  return sorted;
}

export function activeFilterCount(filters: ResultFilters): number {
  return (Object.keys(DEFAULT_FILTERS) as Array<keyof ResultFilters>).filter((key) => filters[key] !== DEFAULT_FILTERS[key]).length;
}

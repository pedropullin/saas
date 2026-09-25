import type { LatLng, ResultPlace } from "@/lib/types";

export interface MapItem {
  place: ResultPlace;
  index: number;
}

export interface MapProps {
  items: MapItem[];
  selectedId: string | null;
  /** Ponto de referência (localização atual). */
  reference: LatLng | null;
  /** Círculo da busca por raio. */
  circle: { center: LatLng; radiusKm: number } | null;
  onSelect: (id: string) => void;
}

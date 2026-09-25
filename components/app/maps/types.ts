import type { Place } from "@/lib/types";

export interface MapItem {
  place: Place;
  index: number;
}

export interface MapProps {
  items: MapItem[];
  selectedId: string | null;
  savedIds: Set<string>;
  near: { lat: number; lng: number } | null;
  onSelect: (id: string) => void;
}

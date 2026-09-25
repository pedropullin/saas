import type { LatLng } from "./types";

export interface Rect {
  low: LatLng;
  high: LatLng;
}

const EARTH_KM = 6371;
const rad = (deg: number) => (deg * Math.PI) / 180;

/** Distância em km entre dois pontos (fórmula de haversine). */
export function distanceKm(a: LatLng, b: LatLng): number {
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Retângulo que envolve um círculo de raio `km` em volta de `center`. */
export function boundingBox(center: LatLng, km: number): Rect {
  const dLat = (km / EARTH_KM) * (180 / Math.PI);
  const dLng = dLat / Math.max(Math.cos(rad(center.lat)), 0.01);
  return {
    low: { lat: Math.max(-90, center.lat - dLat), lng: Math.max(-180, center.lng - dLng) },
    high: { lat: Math.min(90, center.lat + dLat), lng: Math.min(180, center.lng + dLng) },
  };
}

/** Divide um retângulo em n×n partes iguais (busca em varredura). */
export function splitRect(rect: Rect, n: number): Rect[] {
  if (n <= 1) return [rect];
  const cells: Rect[] = [];
  const latStep = (rect.high.lat - rect.low.lat) / n;
  const lngStep = (rect.high.lng - rect.low.lng) / n;
  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      cells.push({
        low: { lat: rect.low.lat + latStep * row, lng: rect.low.lng + lngStep * col },
        high: { lat: rect.low.lat + latStep * (row + 1), lng: rect.low.lng + lngStep * (col + 1) },
      });
    }
  }
  return cells;
}

export function formatDistance(km: number | null): string {
  if (km == null) return "Não disponível";
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toLocaleString("pt-BR", { maximumFractionDigits: km < 10 ? 1 : 0 })} km`;
}

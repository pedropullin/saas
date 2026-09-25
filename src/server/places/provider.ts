import "server-only";
import type { Rect } from "@/lib/geo";
import type { LatLng, Place, PlaceDetails } from "@/lib/types";

export interface ProviderSearchRequest {
  textQuery: string;
  /** Resultados só dentro do retângulo (busca por raio e varredura). */
  restriction?: Rect;
  /** Preferência (não obrigatória) por resultados perto de um ponto. */
  bias?: { center: LatLng; radiusKm: number };
  regionCode?: string;
  minRating?: number;
  openNow?: boolean;
  pageToken?: string;
}

export interface ProviderSearchResult {
  places: Place[];
  nextPageToken: string | null;
}

export interface GeoArea {
  label: string;
  center: LatLng;
  viewport: Rect | null;
}

/**
 * Contrato de qualquer fonte de empresas. Hoje: Google Places (oficial) e
 * demonstração (fictícia, marcada). Outra fonte só precisa implementar isto.
 */
export interface PlacesProvider {
  id: "google" | "demo";
  search(request: ProviderSearchRequest): Promise<ProviderSearchResult>;
  details(placeId: string): Promise<PlaceDetails>;
  geocode(text: string): Promise<GeoArea | null>;
  photoUri(photoName: string, maxWidth: number): Promise<string | null>;
}

export class PlacesError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

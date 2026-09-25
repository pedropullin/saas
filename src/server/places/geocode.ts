import "server-only";
import { eq } from "drizzle-orm";
import { getDb } from "../db/client";
import { geocodeCache } from "../db/schema";
import { getPlacesProvider } from "./index";
import type { GeoArea } from "./provider";

const TTL_MS = 30 * 86_400_000; // limite dos termos do Google para guardar coordenadas

function key(provider: string, text: string): string {
  return `${provider}:${text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim()}`;
}

/** Coordenadas de uma área ("Pinheiros, São Paulo"), com cache de 30 dias. */
export async function geocodeArea(text: string): Promise<GeoArea | null> {
  const provider = getPlacesProvider();
  const cacheKey = key(provider.id, text);
  const db = await getDb();
  const [cached] = await db.select().from(geocodeCache).where(eq(geocodeCache.key, cacheKey)).limit(1);
  if (cached && Date.now() - cached.fetchedAt.getTime() < TTL_MS) {
    return { label: cached.label, center: { lat: cached.lat, lng: cached.lng }, viewport: cached.viewport };
  }
  const area = await provider.geocode(text);
  if (!area) return null;
  const values = { key: cacheKey, label: area.label, lat: area.center.lat, lng: area.center.lng, viewport: area.viewport, fetchedAt: new Date() };
  await db.insert(geocodeCache).values(values).onConflictDoUpdate({ target: geocodeCache.key, set: values });
  return area;
}

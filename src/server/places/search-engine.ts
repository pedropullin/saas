import "server-only";
import { and, eq, sql } from "drizzle-orm";
import { boundingBox, distanceKm, splitRect, type Rect } from "@/lib/geo";
import { getPlan } from "@/lib/plans";
import { describeSearch, locationText, searchParamsSchema, subjectText, type SearchParams, type SearchParamsInput } from "@/lib/search";
import type { LatLng, Place, ResultPlace } from "@/lib/types";
import { EMPTY_SAVED } from "@/lib/types";
import { mapLimit } from "@/lib/utils";
import type { AuthContext } from "../auth/session";
import { addUsage, consumeSearches } from "../billing/usage";
import { savedStateFor } from "../companies/service";
import { getDb } from "../db/client";
import { searches } from "../db/schema";
import { AppError, NotFoundError, PlanLimitError } from "../errors";
import { geocodeArea } from "./geocode";
import { getPlacesProvider } from "./index";
import type { ProviderSearchRequest } from "./provider";

interface CursorEntry {
  request: ProviderSearchRequest;
  token: string;
  pages: number;
}

interface StoredCursor {
  entries: CursorEntry[];
  reference: LatLng | null;
  radius: { center: LatLng; km: number } | null;
}

export interface SearchOutcome {
  searchId: string;
  description: string;
  places: ResultPlace[];
  hasMore: boolean;
  moreLockedByPlan: boolean;
  center: LatLng | null;
  radiusKm: number | null;
  areaLabel: string | null;
  regions: number;
  demo: boolean;
}

interface Plan {
  textQuery: string;
  cells: Array<Rect | null>;
  bias?: ProviderSearchRequest["bias"];
  center: LatLng | null;
  radius: StoredCursor["radius"];
  areaLabel: string | null;
}

/** Traduz os filtros de localização em chamadas ao provedor (texto, raio ou varredura). */
async function planSearch(params: SearchParams): Promise<Plan> {
  const subject = subjectText(params);
  if (!subject) throw new AppError("Diga o que você procura ou escolha uma categoria.");
  const where = locationText(params);

  if (params.scope === "mundial") {
    return { textQuery: subject, cells: [null], center: null, radius: null, areaLabel: "Mundial" };
  }

  if (params.scope === "raio") {
    let center = params.center ? { lat: params.center.lat, lng: params.center.lng } : null;
    let label = params.center?.label ?? null;
    if (where) {
      const area = await geocodeArea(where);
      if (!area) throw new AppError(`Não encontramos “${where}”. Confira a cidade, o bairro ou o CEP.`);
      center = area.center;
      label = area.label;
    }
    if (!center) throw new AppError("Para buscar por raio, informe uma cidade, bairro ou CEP, ou use sua localização atual.");
    const rect = boundingBox(center, params.radiusKm);
    return {
      textQuery: subject,
      cells: splitRect(rect, params.sweep),
      center,
      radius: { center, km: params.radiusKm },
      areaLabel: label,
    };
  }

  // Local: o lugar vai no texto; em varredura, a área é dividida em partes.
  if (where) {
    if (params.sweep > 1) {
      const area = await geocodeArea(where);
      if (!area) throw new AppError(`Não encontramos “${where}”.`);
      const rect = area.viewport ?? boundingBox(area.center, 8);
      return { textQuery: subject, cells: splitRect(rect, params.sweep), center: area.center, radius: null, areaLabel: area.label };
    }
    return { textQuery: `${subject} em ${where}`, cells: [null], center: null, radius: null, areaLabel: where };
  }

  if (params.center) {
    const center = { lat: params.center.lat, lng: params.center.lng };
    if (params.sweep > 1) {
      return {
        textQuery: subject,
        cells: splitRect(boundingBox(center, params.radiusKm), params.sweep),
        center,
        radius: null,
        areaLabel: params.center.label ?? null,
      };
    }
    return {
      textQuery: subject,
      cells: [null],
      bias: { center, radiusKm: params.radiusKm },
      center,
      radius: null,
      areaLabel: params.center.label ?? null,
    };
  }
  return { textQuery: subject, cells: [null], center: null, radius: null, areaLabel: null };
}

function merge(target: Map<string, Place>, places: Place[]) {
  for (const place of places) if (!target.has(place.id)) target.set(place.id, place);
}

async function decorate(auth: AuthContext, places: Place[], cursor: StoredCursor): Promise<ResultPlace[]> {
  const inRadius = cursor.radius
    ? places.filter((p) => !p.location || distanceKm(cursor.radius!.center, p.location) <= cursor.radius!.km * 1.02)
    : places;
  const { saved, enrichment } = await savedStateFor(auth.org.id, auth.user.id, inRadius.map((p) => p.id));
  return inRadius.map((place) => ({
    ...place,
    distanceKm: cursor.reference && place.location ? Math.round(distanceKm(cursor.reference, place.location) * 10) / 10 : null,
    saved: saved[place.id] ?? EMPTY_SAVED,
    enrichment: enrichment[place.id] ?? null,
  }));
}

export async function startSearch(auth: AuthContext, input: SearchParamsInput): Promise<SearchOutcome> {
  const params = searchParamsSchema.parse(input);
  const plan = getPlan(auth.org.plan);
  if (params.sweep > plan.sweep) {
    throw new PlanLimitError(`A varredura ${params.sweep}×${params.sweep} não está no plano ${plan.name}. Use ${plan.sweep}×${plan.sweep} ou mude de plano.`);
  }
  const provider = getPlacesProvider();
  const planned = await planSearch(params);
  await consumeSearches(auth.org.id, plan, planned.cells.length);

  const base: ProviderSearchRequest = {
    textQuery: planned.textQuery,
    regionCode: params.country,
    minRating: params.minRating,
    openNow: params.openNow,
  };
  const requests = planned.cells.map((cell) => (cell ? { ...base, restriction: cell } : { ...base, bias: planned.bias }));
  const pages = await mapLimit(requests, 3, (request) => provider.search(request));

  const found = new Map<string, Place>();
  const entries: CursorEntry[] = [];
  pages.forEach((page, i) => {
    merge(found, page.places);
    if (page.nextPageToken) entries.push({ request: requests[i]!, token: page.nextPageToken, pages: 1 });
  });

  const cursor: StoredCursor = {
    entries,
    reference: params.reference ?? planned.center,
    radius: planned.radius,
  };
  const places = await decorate(auth, [...found.values()], cursor);
  const description = describeSearch(params);

  const db = await getDb();
  const [row] = await db
    .insert(searches)
    .values({
      orgId: auth.org.id,
      userId: auth.user.id,
      query: description,
      params: params as unknown as Record<string, unknown>,
      cursor,
      resultCount: places.length,
      provider: provider.id,
    })
    .returning({ id: searches.id });
  await addUsage(auth.org.id, { results: places.length });

  const hasTokens = entries.length > 0;
  return {
    searchId: row!.id,
    description,
    places,
    hasMore: hasTokens && plan.pagesPerSearch > 1,
    moreLockedByPlan: hasTokens && plan.pagesPerSearch <= 1,
    center: planned.center,
    radiusKm: planned.radius?.km ?? null,
    areaLabel: planned.areaLabel,
    regions: planned.cells.length,
    demo: provider.id === "demo",
  };
}

export async function continueSearch(auth: AuthContext, searchId: string): Promise<{ places: ResultPlace[]; hasMore: boolean }> {
  const db = await getDb();
  const [row] = await db
    .select()
    .from(searches)
    .where(and(eq(searches.id, searchId), eq(searches.orgId, auth.org.id), eq(searches.userId, auth.user.id)))
    .limit(1);
  if (!row) throw new NotFoundError("Pesquisa não encontrada. Faça uma nova busca.");
  const plan = getPlan(auth.org.plan);
  const cursor = row.cursor as StoredCursor | null;
  const pending = (cursor?.entries ?? []).filter((entry) => entry.pages < plan.pagesPerSearch);
  if (!cursor || !pending.length) return { places: [], hasMore: false };

  const provider = getPlacesProvider();
  const pages = await mapLimit(pending, 3, (entry) => provider.search({ ...entry.request, pageToken: entry.token }));
  const found = new Map<string, Place>();
  const entries: CursorEntry[] = [];
  pages.forEach((page, i) => {
    merge(found, page.places);
    const entry = pending[i]!;
    if (page.nextPageToken) entries.push({ request: entry.request, token: page.nextPageToken, pages: entry.pages + 1 });
  });
  const places = await decorate(auth, [...found.values()], cursor);
  await db
    .update(searches)
    .set({ cursor: { ...cursor, entries }, resultCount: sql`${searches.resultCount} + ${places.length}` })
    .where(eq(searches.id, row.id));
  await addUsage(auth.org.id, { results: places.length });
  return { places, hasMore: entries.some((entry) => entry.pages < plan.pagesPerSearch) };
}

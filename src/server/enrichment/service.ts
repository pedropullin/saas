import "server-only";
import { eq } from "drizzle-orm";
import type { Enrichment, Place } from "@/lib/types";
import { getDb } from "../db/client";
import { enrichmentCache } from "../db/schema";
import { demoEnrichment } from "../places/demo";
import { extractContacts } from "./extract";
import { fetchPublicHtml } from "./safe-fetch";

const TTL_MS = Number(process.env.ENRICHMENT_CACHE_DAYS ?? 14) * 86_400_000;

function cacheKey(website: string): string | null {
  try {
    const url = new URL(website);
    return `${url.protocol}//${url.hostname.replace(/^www\./, "")}`;
  } catch {
    return null;
  }
}

/** Lê o site da empresa (home + página de contato) e guarda o resultado por 14 dias. */
export async function enrichWebsite(website: string): Promise<Enrichment> {
  const key = cacheKey(website);
  const empty = (error: string): Enrichment => ({
    url: website,
    ok: false,
    emails: [],
    instagram: null,
    facebook: null,
    linkedin: null,
    whatsapp: null,
    fetchedAt: new Date().toISOString(),
    error,
  });
  if (!key) return empty("URL inválida");

  const db = await getDb();
  const [cached] = await db.select().from(enrichmentCache).where(eq(enrichmentCache.url, key)).limit(1);
  if (cached && Date.now() - cached.fetchedAt.getTime() < TTL_MS) return cached.data;

  let result: Enrichment;
  try {
    const home = await fetchPublicHtml(website);
    const found = extractContacts(home.body, home.url);
    if (!found.emails.length && found.contactPage) {
      const contact = await fetchPublicHtml(found.contactPage).catch(() => null);
      if (contact) {
        const more = extractContacts(contact.body, contact.url);
        found.emails = more.emails;
        found.instagram ??= more.instagram;
        found.facebook ??= more.facebook;
        found.linkedin ??= more.linkedin;
        found.whatsapp ??= more.whatsapp;
      }
    }
    result = {
      url: home.url,
      ok: home.status < 400,
      emails: found.emails,
      instagram: found.instagram,
      facebook: found.facebook,
      linkedin: found.linkedin,
      whatsapp: found.whatsapp,
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    result = empty(error instanceof Error ? error.message : "Falha ao ler o site");
  }

  await db
    .insert(enrichmentCache)
    .values({ url: key, data: result, fetchedAt: new Date() })
    .onConflictDoUpdate({ target: enrichmentCache.url, set: { data: result, fetchedAt: new Date() } });
  return result;
}

/** Enriquecimento em lote com concorrência limitada. */
export async function enrichPlaces(places: Place[], concurrency = 5): Promise<Record<string, Enrichment>> {
  const output: Record<string, Enrichment> = {};
  const queue = places.filter((place) => place.website);
  const workers = Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
    for (let next = queue.shift(); next; next = queue.shift()) {
      output[next.id] = next.demo ? demoEnrichment(next)! : await enrichWebsite(next.website!);
    }
  });
  await Promise.all(workers);
  return output;
}

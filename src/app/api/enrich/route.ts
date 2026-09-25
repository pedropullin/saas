import { z } from "zod";
import { placeSchema } from "@/lib/place-schema";
import type { Place } from "@/lib/types";
import { addUsage } from "@/server/billing/usage";
import { setEnrichment } from "@/server/companies/service";
import { enrichPlaces } from "@/server/enrichment/service";
import { apiRoute } from "@/server/http";

/** Lê os sites das empresas e devolve e-mails e redes sociais públicos encontrados. */
export async function POST(request: Request) {
  return apiRoute(request, async (auth) => {
    const body = z.object({ places: z.array(placeSchema).min(1).max(20) }).parse(await request.json());
    const results = await enrichPlaces(body.places as Place[]);
    await setEnrichment(auth.org.id, results);
    await addUsage(auth.org.id, { enrichments: Object.keys(results).length });
    return { results };
  });
}

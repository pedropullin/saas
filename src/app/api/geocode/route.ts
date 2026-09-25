import { z } from "zod";
import { apiRoute, jsonError } from "@/server/http";
import { geocodeArea } from "@/server/places/geocode";

export async function GET(request: Request) {
  return apiRoute(request, async () => {
    const q = z.string().trim().min(2).max(160).parse(new URL(request.url).searchParams.get("q") ?? "");
    const area = await geocodeArea(q);
    if (!area) return jsonError(`Não encontramos “${q}”.`, 404);
    return area;
  });
}

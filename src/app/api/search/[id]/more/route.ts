import { z } from "zod";
import { apiRoute } from "@/server/http";
import { continueSearch } from "@/server/places/search-engine";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return apiRoute(request, async (auth) => continueSearch(auth, z.uuid().parse((await params).id)));
}

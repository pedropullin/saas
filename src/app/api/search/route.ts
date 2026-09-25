import { apiRoute } from "@/server/http";
import { startSearch } from "@/server/places/search-engine";

export async function POST(request: Request) {
  return apiRoute(request, async (auth) => startSearch(auth, await request.json()));
}

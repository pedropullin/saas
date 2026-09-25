import { NextResponse } from "next/server";
import { demoSearch } from "@/lib/demo-data";
import { PlacesError, searchPlaces } from "@/lib/google-places";
import { isAuthorized } from "@/lib/session";
import { parseSearchRequest } from "@/lib/validate";

export async function POST(request: Request) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: "Sessão expirada. Entre de novo com seu código." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = parseSearchRequest(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return NextResponse.json(demoSearch(parsed.value));

  try {
    return NextResponse.json(await searchPlaces(parsed.value, apiKey));
  } catch (error) {
    if (error instanceof PlacesError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("[places/search]", error);
    return NextResponse.json({ error: "Erro inesperado na busca." }, { status: 500 });
  }
}

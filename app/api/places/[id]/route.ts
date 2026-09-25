import { NextResponse } from "next/server";
import { getPlaceDetails, PlacesError } from "@/lib/google-places";
import { isAuthorized } from "@/lib/session";
import { isValidPlaceId } from "@/lib/validate";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: "Sessão expirada. Entre de novo com seu código." }, { status: 401 });
  }

  const { id } = await params;
  if (!isValidPlaceId(id)) return NextResponse.json({ error: "Empresa inválida." }, { status: 400 });

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Detalhes indisponíveis no modo demonstração." }, { status: 404 });
  }

  try {
    return NextResponse.json(await getPlaceDetails(id, apiKey));
  } catch (error) {
    if (error instanceof PlacesError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("[places/details]", error);
    return NextResponse.json({ error: "Erro inesperado ao carregar a empresa." }, { status: 500 });
  }
}

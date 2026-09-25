import { NextResponse } from "next/server";
import { apiRoute, jsonError } from "@/server/http";
import { getPlacesProvider } from "@/server/places";

/**
 * Foto de uma empresa: a chave fica no servidor e o navegador é redirecionado
 * para a URL temporária da imagem no Google.
 */
export async function GET(request: Request) {
  return apiRoute(request, async () => {
    const url = new URL(request.url);
    const name = url.searchParams.get("name") ?? "";
    const width = Number(url.searchParams.get("w") ?? 400);
    if (!/^places\/[A-Za-z0-9_-]+\/photos\/[A-Za-z0-9_-]+$/.test(name)) return jsonError("Foto inválida.", 400);
    const uri = await getPlacesProvider().photoUri(name, Number.isFinite(width) ? width : 400);
    if (!uri) return jsonError("Foto não encontrada.", 404);
    const response = NextResponse.redirect(uri, 302);
    response.headers.set("Cache-Control", "private, max-age=3600");
    return response;
  });
}

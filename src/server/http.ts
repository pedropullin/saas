import "server-only";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { requireAuth, type AuthContext } from "./auth/session";
import { AppError } from "./errors";
import { PlacesError } from "./places/provider";

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return request.method === "GET";
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function jsonError(error: string, status: number, code?: string) {
  return NextResponse.json({ error, code }, { status });
}

/** Rotas de API: exige sessão, bloqueia requisições de outra origem e padroniza erros. */
export async function apiRoute(request: Request, handler: (auth: AuthContext) => Promise<unknown>): Promise<Response> {
  try {
    if (request.method !== "GET" && !sameOrigin(request)) return jsonError("Origem não permitida.", 403, "origem");
    const auth = await requireAuth();
    const result = await handler(auth);
    return result instanceof Response ? result : NextResponse.json(result);
  } catch (error) {
    if (error instanceof AppError) return jsonError(error.message, error.status, error.code);
    if (error instanceof PlacesError) return jsonError(error.message, error.status, "provedor");
    if (error instanceof ZodError) return jsonError(error.issues[0]?.message ?? "Dados inválidos.", 400, "invalido");
    console.error("[api]", error);
    return jsonError("Erro inesperado. Tente novamente.", 500);
  }
}

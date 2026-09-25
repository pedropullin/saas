import { NextResponse, type NextRequest } from "next/server";
import { isGateEnabled, readSessionToken, SESSION_COOKIE } from "@/lib/session";

/**
 * Checagem otimista: sem sessão válida, páginas vão para /entrar e a API responde 401.
 * Os route handlers validam a sessão de novo antes de gastar cota do Google.
 */
export async function proxy(request: NextRequest) {
  if (!isGateEnabled()) return NextResponse.next();

  const session = await readSessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (session) return NextResponse.next();

  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Sessão expirada. Entre de novo com seu código." }, { status: 401 });
  }

  const login = new URL("/entrar", request.url);
  login.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/prospectar/:path*", "/lista/:path*", "/api/places/:path*"],
};

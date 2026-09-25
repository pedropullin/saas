import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "prospecta_session";

/**
 * Checagem otimista: sem cookie de sessão, a área logada manda para o login.
 * A validação real (sessão no banco, organização e papel) acontece em cada página,
 * action e rota de API.
 */
export function proxy(request: NextRequest) {
  if (request.cookies.get(SESSION_COOKIE)?.value) return NextResponse.next();
  const login = new URL("/entrar", request.url);
  login.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/app/:path*"],
};

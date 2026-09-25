import { NextResponse } from "next/server";
import {
  createSessionToken,
  isGateEnabled,
  isValidAccessCode,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
} from "@/lib/session";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { name?: unknown; code?: unknown } | null;
  const name = typeof body?.name === "string" ? body.name.trim().slice(0, 40) : "";
  const code = typeof body?.code === "string" ? body.code : "";

  if (!name) return NextResponse.json({ error: "Diga seu nome para personalizar as mensagens." }, { status: 400 });

  if (isGateEnabled() && !isValidAccessCode(code)) {
    // Freia tentativas em sequência.
    await new Promise((resolve) => setTimeout(resolve, 600));
    return NextResponse.json({ error: "Código de acesso incorreto." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true, name });
  response.cookies.set(SESSION_COOKIE, await createSessionToken(name), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}

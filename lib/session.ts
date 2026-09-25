/**
 * Sessão assinada (HMAC-SHA256) guardada em cookie httpOnly.
 * Usa Web Crypto para funcionar igual no proxy e nos route handlers.
 */
export const SESSION_COOKIE = "prospecta_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 dias

export interface Session {
  name: string;
  exp: number;
}

export function accessCodes(): string[] {
  return (process.env.PROSPECTA_ACCESS_CODES ?? "")
    .split(",")
    .map((code) => code.trim())
    .filter(Boolean);
}

/** Sem códigos configurados o acesso é livre (uso local). */
export function isGateEnabled(): boolean {
  return accessCodes().length > 0;
}

function secret(): string {
  return process.env.PROSPECTA_SESSION_SECRET || `prospecta:${accessCodes().join(",")}`;
}

const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64 + "=".repeat((4 - (base64.length % 4)) % 4));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function hmac(payload: string, key: string): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(payload));
  return toBase64Url(new Uint8Array(signature));
}

/** Comparação em tempo constante para strings. */
export function safeEqual(a: string, b: string): boolean {
  const left = encoder.encode(a);
  const right = encoder.encode(b);
  let diff = left.length ^ right.length;
  const length = Math.max(left.length, right.length);
  for (let i = 0; i < length; i++) diff |= (left[i] ?? 0) ^ (right[i] ?? 0);
  return diff === 0;
}

export function isValidAccessCode(code: string): boolean {
  let ok = false;
  for (const valid of accessCodes()) ok = safeEqual(code.trim(), valid) || ok;
  return ok;
}

export async function createSessionToken(name: string, now = Date.now(), key = secret()): Promise<string> {
  const exp = Math.floor(now / 1000) + SESSION_MAX_AGE;
  const payload = `${toBase64Url(encoder.encode(name))}.${exp}`;
  return `${payload}.${await hmac(payload, key)}`;
}

export async function readSessionToken(
  token: string | undefined | null,
  now = Date.now(),
  key = secret(),
): Promise<Session | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [encodedName, expRaw, signature] = parts as [string, string, string];
  const expected = await hmac(`${encodedName}.${expRaw}`, key);
  if (!safeEqual(signature, expected)) return null;
  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || exp * 1000 < now) return null;
  try {
    return { name: new TextDecoder().decode(fromBase64Url(encodedName)), exp };
  } catch {
    return null;
  }
}

/** Lê o cookie de sessão a partir do header Cookie de uma Request. */
export function tokenFromRequest(request: Request): string | null {
  const header = request.headers.get("cookie") ?? "";
  for (const part of header.split(";")) {
    const [rawName, ...rest] = part.trim().split("=");
    if (rawName === SESSION_COOKIE) return decodeURIComponent(rest.join("="));
  }
  return null;
}

/** Para route handlers: libera se o acesso é livre ou se a sessão é válida. */
export async function isAuthorized(request: Request): Promise<boolean> {
  if (!isGateEnabled()) return true;
  return (await readSessionToken(tokenFromRequest(request))) !== null;
}

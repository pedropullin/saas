import "server-only";
import { and, eq, gt } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import type { PlanId } from "@/lib/plans";
import { getDb } from "../db/client";
import { memberships, organizations, sessions, users, type Role } from "../db/schema";
import { ForbiddenError, UnauthorizedError } from "../errors";
import { randomToken, sha256 } from "./crypto";

export const SESSION_COOKIE = "prospecta_session";
const SESSION_DAYS = 30;

export interface AuthContext {
  sessionId: string;
  user: { id: string; email: string; name: string; avatarUrl: string | null; title: string | null };
  org: { id: string; name: string; plan: PlanId };
  role: Role;
}

export async function createSession(userId: string, orgId: string): Promise<void> {
  const token = randomToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  const userAgent = (await headers()).get("user-agent")?.slice(0, 200) ?? null;
  const db = await getDb();
  await db.insert(sessions).values({ id: sha256(token), userId, orgId, expiresAt, userAgent });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

/** Sessão atual (uma consulta por requisição, graças ao cache do React). */
export const getAuth = cache(async (): Promise<AuthContext | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || token.length > 100) return null;
  const db = await getDb();
  const [row] = await db
    .select({
      sessionId: sessions.id,
      user: { id: users.id, email: users.email, name: users.name, avatarUrl: users.avatarUrl, title: users.title },
      org: { id: organizations.id, name: organizations.name, plan: organizations.plan },
      role: memberships.role,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .innerJoin(organizations, eq(organizations.id, sessions.orgId))
    .innerJoin(memberships, and(eq(memberships.orgId, sessions.orgId), eq(memberships.userId, sessions.userId)))
    .where(and(eq(sessions.id, sha256(token)), gt(sessions.expiresAt, new Date())))
    .limit(1);
  return row ?? null;
});

/** Para páginas: sem sessão, vai para o login. */
export async function requirePageAuth(): Promise<AuthContext> {
  const auth = await getAuth();
  if (!auth) redirect("/entrar");
  return auth;
}

/** Para actions e APIs: sem sessão, erro 401. */
export async function requireAuth(): Promise<AuthContext> {
  const auth = await getAuth();
  if (!auth) throw new UnauthorizedError();
  return auth;
}

export function requireRole(auth: AuthContext, roles: Role[]): void {
  if (!roles.includes(auth.role)) throw new ForbiddenError("Só o dono ou administradores da equipe podem fazer isso.");
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    const db = await getDb();
    await db.delete(sessions).where(eq(sessions.id, sha256(token)));
  }
  store.delete(SESSION_COOKIE);
}

export async function setSessionOrg(auth: AuthContext, orgId: string): Promise<void> {
  const db = await getDb();
  const [member] = await db
    .select({ orgId: memberships.orgId })
    .from(memberships)
    .where(and(eq(memberships.orgId, orgId), eq(memberships.userId, auth.user.id)))
    .limit(1);
  if (!member) throw new ForbiddenError("Você não faz parte dessa equipe.");
  await db.update(sessions).set({ orgId }).where(eq(sessions.id, auth.sessionId));
}

export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
}

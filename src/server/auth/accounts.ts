import "server-only";
import { and, asc, eq, sql } from "drizzle-orm";
import { getPlan } from "@/lib/plans";
import { logActivity } from "../activity/service";
import { getDb } from "../db/client";
import { invitations, memberships, organizations, sessions, userSettings, users, type Role } from "../db/schema";
import { AppError, PlanLimitError } from "../errors";
import { notifyAdmins } from "../notifications/service";
import { DUMMY_HASH, hashPassword, randomToken, sha256, verifyPassword } from "./crypto";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
  orgName?: string;
  inviteToken?: string;
}): Promise<{ userId: string; orgId: string }> {
  const db = await getDb();
  const email = normalizeEmail(input.email);
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing) throw new AppError("Já existe uma conta com este e-mail. Entre com sua senha.", 409, "email_em_uso");

  const passwordHash = await hashPassword(input.password);
  const [user] = await db.insert(users).values({ email, name: input.name.trim(), passwordHash }).returning({ id: users.id });
  await db.insert(userSettings).values({ userId: user!.id });

  if (input.inviteToken) {
    const orgId = await acceptInvitation(input.inviteToken, user!.id);
    return { userId: user!.id, orgId };
  }

  const [org] = await db
    .insert(organizations)
    .values({ name: input.orgName?.trim() || `Equipe de ${input.name.trim().split(/\s+/)[0]}` })
    .returning({ id: organizations.id });
  await db.insert(memberships).values({ orgId: org!.id, userId: user!.id, role: "owner" });
  return { userId: user!.id, orgId: org!.id };
}

/** Retorna o usuário e a organização padrão, ou null. Sempre roda o scrypt (sem vazar se o e-mail existe). */
export async function authenticate(email: string, password: string): Promise<{ userId: string; orgId: string } | null> {
  const db = await getDb();
  const [user] = await db
    .select({ id: users.id, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.email, normalizeEmail(email)))
    .limit(1);
  const valid = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !valid) return null;

  // Volta para a última organização usada; senão, a mais antiga.
  const [last] = await db
    .select({ orgId: sessions.orgId })
    .from(sessions)
    .innerJoin(memberships, and(eq(memberships.orgId, sessions.orgId), eq(memberships.userId, sessions.userId)))
    .where(eq(sessions.userId, user.id))
    .orderBy(sql`${sessions.createdAt} desc`)
    .limit(1);
  if (last) return { userId: user.id, orgId: last.orgId };
  const [first] = await db
    .select({ orgId: memberships.orgId })
    .from(memberships)
    .where(eq(memberships.userId, user.id))
    .orderBy(asc(memberships.joinedAt))
    .limit(1);
  if (!first) return null;
  return { userId: user.id, orgId: first.orgId };
}

export async function changePassword(userId: string, current: string, next: string): Promise<void> {
  const db = await getDb();
  const [user] = await db.select({ passwordHash: users.passwordHash }).from(users).where(eq(users.id, userId)).limit(1);
  if (!user || !(await verifyPassword(current, user.passwordHash))) throw new AppError("Senha atual incorreta.");
  await db.update(users).set({ passwordHash: await hashPassword(next) }).where(eq(users.id, userId));
}

/* ───────────── Convites ───────────── */

const INVITE_DAYS = 7;

export async function createInvitation(orgId: string, createdBy: string, role: Role = "member", email?: string) {
  const db = await getDb();
  await assertSeatAvailable(orgId);
  const token = randomToken(24);
  const expiresAt = new Date(Date.now() + INVITE_DAYS * 86_400_000);
  const [invite] = await db
    .insert(invitations)
    .values({ orgId, createdBy, role: role === "owner" ? "admin" : role, email: email ? normalizeEmail(email) : null, tokenHash: sha256(token), expiresAt })
    .returning({ id: invitations.id });
  return { id: invite!.id, token, expiresAt };
}

export async function findInvitation(token: string) {
  const db = await getDb();
  const [invite] = await db
    .select({
      id: invitations.id,
      orgId: invitations.orgId,
      orgName: organizations.name,
      role: invitations.role,
      email: invitations.email,
      expiresAt: invitations.expiresAt,
      acceptedAt: invitations.acceptedAt,
      revokedAt: invitations.revokedAt,
    })
    .from(invitations)
    .innerJoin(organizations, eq(organizations.id, invitations.orgId))
    .where(eq(invitations.tokenHash, sha256(token)))
    .limit(1);
  if (!invite) return null;
  const valid = !invite.acceptedAt && !invite.revokedAt && invite.expiresAt > new Date();
  return { ...invite, valid };
}

async function assertSeatAvailable(orgId: string) {
  const db = await getDb();
  const [org] = await db.select({ plan: organizations.plan }).from(organizations).where(eq(organizations.id, orgId)).limit(1);
  const [{ count }] = (await db
    .select({ count: sql<number>`count(*)::int` })
    .from(memberships)
    .where(eq(memberships.orgId, orgId))) as [{ count: number }];
  const plan = getPlan(org?.plan);
  if (count >= plan.maxMembers) {
    throw new PlanLimitError(
      plan.maxMembers === 1
        ? `O plano ${plan.name} é individual. Mude para o Business para convidar a equipe.`
        : `O plano ${plan.name} permite até ${plan.maxMembers} membros.`,
    );
  }
}

/** Link de uso único: adiciona o usuário à organização do convite. */
export async function acceptInvitation(token: string, userId: string): Promise<string> {
  const db = await getDb();
  const invite = await findInvitation(token);
  if (!invite || !invite.valid) throw new AppError("Convite inválido, expirado ou já usado. Peça um novo link.", 410, "convite_invalido");

  const [already] = await db
    .select({ orgId: memberships.orgId })
    .from(memberships)
    .where(and(eq(memberships.orgId, invite.orgId), eq(memberships.userId, userId)))
    .limit(1);
  if (!already) {
    await assertSeatAvailable(invite.orgId);
    await db.insert(memberships).values({ orgId: invite.orgId, userId, role: invite.role });
  }
  await db.update(invitations).set({ acceptedAt: new Date(), acceptedBy: userId }).where(eq(invitations.id, invite.id));

  const [user] = await db.select({ name: users.name }).from(users).where(eq(users.id, userId)).limit(1);
  await logActivity({ orgId: invite.orgId, userId, type: "membro_entrou", summary: `${user?.name ?? "Alguém"} entrou na equipe` });
  await notifyAdmins(invite.orgId, userId, `${user?.name ?? "Um novo membro"} entrou na equipe`, undefined, "/app/equipe");
  return invite.orgId;
}

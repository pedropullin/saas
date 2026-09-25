import "server-only";
import { and, asc, eq, gt, isNull, sql } from "drizzle-orm";
import type { AuthContext } from "../auth/session";
import { requireRole } from "../auth/session";
import { getDb } from "../db/client";
import { invitations, leads, memberships, sessions, users, type Role } from "../db/schema";
import { AppError, ForbiddenError, NotFoundError } from "../errors";

export async function listMembers(orgId: string) {
  const db = await getDb();
  const rows = await db
    .select({
      userId: users.id,
      name: users.name,
      email: users.email,
      avatarUrl: users.avatarUrl,
      title: users.title,
      role: memberships.role,
      joinedAt: memberships.joinedAt,
      assigned: sql<number>`(select count(*)::int from ${leads} where ${leads.orgId} = ${orgId} and ${leads.assignedTo} = ${users.id})`,
      contacted: sql<number>`(select count(*)::int from ${leads} where ${leads.orgId} = ${orgId} and ${leads.assignedTo} = ${users.id} and ${leads.firstContactAt} is not null)`,
      converted: sql<number>`(select count(*)::int from ${leads} where ${leads.orgId} = ${orgId} and ${leads.assignedTo} = ${users.id} and ${leads.status} = 'cliente')`,
    })
    .from(memberships)
    .innerJoin(users, eq(users.id, memberships.userId))
    .where(eq(memberships.orgId, orgId))
    .orderBy(asc(memberships.joinedAt));
  return rows.map((r) => ({ ...r, joinedAt: r.joinedAt.toISOString() }));
}

export async function listPendingInvites(orgId: string) {
  const db = await getDb();
  const rows = await db
    .select({ id: invitations.id, role: invitations.role, email: invitations.email, expiresAt: invitations.expiresAt, createdAt: invitations.createdAt })
    .from(invitations)
    .where(
      and(eq(invitations.orgId, orgId), isNull(invitations.acceptedAt), isNull(invitations.revokedAt), gt(invitations.expiresAt, new Date())),
    )
    .orderBy(asc(invitations.createdAt));
  return rows.map((r) => ({ ...r, expiresAt: r.expiresAt.toISOString(), createdAt: r.createdAt.toISOString() }));
}

export async function revokeInvite(auth: AuthContext, inviteId: string) {
  requireRole(auth, ["owner", "admin"]);
  const db = await getDb();
  await db
    .update(invitations)
    .set({ revokedAt: new Date() })
    .where(and(eq(invitations.orgId, auth.org.id), eq(invitations.id, inviteId)));
}

async function requireMember(orgId: string, userId: string) {
  const db = await getDb();
  const [member] = await db
    .select()
    .from(memberships)
    .where(and(eq(memberships.orgId, orgId), eq(memberships.userId, userId)))
    .limit(1);
  if (!member) throw new NotFoundError("Membro não encontrado.");
  return member;
}

export async function setMemberRole(auth: AuthContext, userId: string, role: Exclude<Role, "owner">) {
  requireRole(auth, ["owner"]);
  const member = await requireMember(auth.org.id, userId);
  if (member.role === "owner") throw new AppError("O dono da conta não pode ter o papel alterado.");
  const db = await getDb();
  await db.update(memberships).set({ role }).where(and(eq(memberships.orgId, auth.org.id), eq(memberships.userId, userId)));
}

export async function removeMember(auth: AuthContext, userId: string) {
  requireRole(auth, ["owner", "admin"]);
  if (userId === auth.user.id) throw new AppError("Você não pode remover a si mesmo.");
  const member = await requireMember(auth.org.id, userId);
  if (member.role === "owner") throw new ForbiddenError("O dono da conta não pode ser removido.");
  if (member.role === "admin" && auth.role !== "owner") throw new ForbiddenError("Só o dono pode remover administradores.");
  const db = await getDb();
  await db.update(leads).set({ assignedTo: null }).where(and(eq(leads.orgId, auth.org.id), eq(leads.assignedTo, userId)));
  await db.delete(sessions).where(and(eq(sessions.orgId, auth.org.id), eq(sessions.userId, userId)));
  await db.delete(memberships).where(and(eq(memberships.orgId, auth.org.id), eq(memberships.userId, userId)));
}

export async function listUserOrgs(userId: string) {
  const db = await getDb();
  const { organizations } = await import("../db/schema");
  return db
    .select({ id: organizations.id, name: organizations.name, role: memberships.role, plan: organizations.plan })
    .from(memberships)
    .innerJoin(organizations, eq(organizations.id, memberships.orgId))
    .where(eq(memberships.userId, userId))
    .orderBy(asc(organizations.name));
}

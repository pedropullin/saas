import "server-only";
import { and, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { getDb } from "../db/client";
import { memberships, notifications } from "../db/schema";

export async function notify(input: { orgId: string; userIds: string[]; title: string; body?: string; href?: string }) {
  const ids = [...new Set(input.userIds)];
  if (!ids.length) return;
  const db = await getDb();
  await db.insert(notifications).values(
    ids.map((userId) => ({ orgId: input.orgId, userId, title: input.title, body: input.body ?? null, href: input.href ?? null })),
  );
}

export async function notifyAdmins(orgId: string, exceptUserId: string | null, title: string, body?: string, href?: string) {
  const db = await getDb();
  const admins = await db
    .select({ userId: memberships.userId })
    .from(memberships)
    .where(and(eq(memberships.orgId, orgId), inArray(memberships.role, ["owner", "admin"])));
  await notify({ orgId, userIds: admins.map((a) => a.userId).filter((id) => id !== exceptUserId), title, body, href });
}

export async function listNotifications(orgId: string, userId: string, limit = 20) {
  const db = await getDb();
  const items = await db
    .select()
    .from(notifications)
    .where(and(eq(notifications.orgId, orgId), eq(notifications.userId, userId)))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
  const [{ unread }] = (await db
    .select({ unread: sql<number>`count(*)::int` })
    .from(notifications)
    .where(and(eq(notifications.orgId, orgId), eq(notifications.userId, userId), isNull(notifications.readAt)))) as [
    { unread: number },
  ];
  return { items, unread };
}

export async function markAllRead(orgId: string, userId: string) {
  const db = await getDb();
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.orgId, orgId), eq(notifications.userId, userId), isNull(notifications.readAt)));
}

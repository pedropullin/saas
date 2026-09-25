"use server";

import { withAuth } from "../action";
import { listNotifications, markAllRead } from "./service";

export async function getNotificationsAction() {
  return withAuth(async (auth) => {
    const { items, unread } = await listNotifications(auth.org.id, auth.user.id);
    return {
      unread,
      items: items.map((n) => ({ id: n.id, title: n.title, body: n.body, href: n.href, read: Boolean(n.readAt), createdAt: n.createdAt.toISOString() })),
    };
  });
}

export async function markNotificationsReadAction() {
  return withAuth((auth) => markAllRead(auth.org.id, auth.user.id));
}

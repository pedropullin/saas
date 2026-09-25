"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { withAuth } from "../action";
import { createInvitation } from "../auth/accounts";
import { requireRole } from "../auth/session";
import { removeMember, revokeInvite, setMemberRole } from "./service";

async function appOrigin(): Promise<string> {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function createInviteAction(role: "member" | "admin" = "member", email?: string) {
  return withAuth(async (auth) => {
    requireRole(auth, ["owner", "admin"]);
    const invite = await createInvitation(auth.org.id, auth.user.id, z.enum(["member", "admin"]).parse(role), email || undefined);
    return { url: `${await appOrigin()}/convite/${invite.token}`, expiresAt: invite.expiresAt.toISOString() };
  });
}

export async function revokeInviteAction(inviteId: string) {
  return withAuth((auth) => revokeInvite(auth, z.uuid().parse(inviteId)));
}

export async function setMemberRoleAction(userId: string, role: "member" | "admin") {
  return withAuth((auth) => setMemberRole(auth, z.uuid().parse(userId), z.enum(["member", "admin"]).parse(role)));
}

export async function removeMemberAction(userId: string) {
  return withAuth((auth) => removeMember(auth, z.uuid().parse(userId)));
}

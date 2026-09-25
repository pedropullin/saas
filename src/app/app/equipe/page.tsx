import type { Metadata } from "next";
import { TeamView } from "@/components/team/TeamView";
import { recentActivity } from "@/server/activity/service";
import { requirePageAuth } from "@/server/auth/session";
import { listMembers, listPendingInvites } from "@/server/team/service";

export const metadata: Metadata = { title: "Minha equipe" };

export default async function EquipePage() {
  const auth = await requirePageAuth();
  const [members, invites, activity] = await Promise.all([listMembers(auth.org.id), listPendingInvites(auth.org.id), recentActivity(auth.org.id, 20)]);
  return (
    <TeamView
      members={members}
      invites={invites}
      activity={activity.map((a) => ({ id: a.id, summary: a.summary, userName: a.userName, userAvatar: a.userAvatar, createdAt: a.createdAt.toISOString() }))}
    />
  );
}

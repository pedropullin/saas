import type { Metadata } from "next";
import { Suspense } from "react";
import { LeadsBoard } from "@/components/leads/LeadsBoard";
import { getPlan } from "@/lib/plans";
import { requirePageAuth } from "@/server/auth/session";
import { listLeads } from "@/server/leads/service";
import { listMembers } from "@/server/team/service";

export const metadata: Metadata = { title: "Leads" };

export default async function LeadsPage() {
  const auth = await requirePageAuth();
  const [leads, members] = await Promise.all([listLeads(auth.org.id), listMembers(auth.org.id)]);
  return (
    <Suspense fallback={null}>
      <LeadsBoard
        initialLeads={leads}
        members={members.map((m) => ({ userId: m.userId, name: m.name, avatarUrl: m.avatarUrl }))}
        canExport={getPlan(auth.org.plan).export}
      />
    </Suspense>
  );
}

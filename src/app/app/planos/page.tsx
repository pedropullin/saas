import { sql, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { PlanCards } from "@/components/marketing/PlanCards";
import { PlanButton } from "@/components/settings/PlanActions";
import { Card, PageHeader } from "@/components/ui/misc";
import { getPlan, PLANS, type PlanId } from "@/lib/plans";
import { cn } from "@/lib/utils";
import { requirePageAuth } from "@/server/auth/session";
import { getBillingProvider } from "@/server/billing/provider";
import { getUsage } from "@/server/billing/usage";
import { getDb } from "@/server/db/client";
import { leads, lists, memberships } from "@/server/db/schema";

export const metadata: Metadata = { title: "Planos" };

async function count(table: typeof leads | typeof lists | typeof memberships, orgId: string) {
  const db = await getDb();
  const [row] = await db.select({ n: sql<number>`count(*)::int` }).from(table).where(eq(table.orgId, orgId));
  return row?.n ?? 0;
}

export default async function PlanosPage({ searchParams }: { searchParams: Promise<{ escolher?: string }> }) {
  const auth = await requirePageAuth();
  const { escolher } = await searchParams;
  const plan = getPlan(auth.org.plan);
  const [usage, leadCount, listCount, memberCount] = await Promise.all([
    getUsage(auth.org.id),
    count(leads, auth.org.id),
    count(lists, auth.org.id),
    count(memberships, auth.org.id),
  ]);
  const canManage = auth.role === "owner" || auth.role === "admin";
  const billing = getBillingProvider();
  const rows = [
    { label: "Pesquisas este mês", used: usage.searches, limit: plan.searchesPerMonth },
    { label: "Leads salvos", used: leadCount, limit: plan.maxLeads },
    { label: "Listas", used: listCount, limit: plan.maxLists },
    { label: "Membros da equipe", used: memberCount, limit: plan.maxMembers },
  ];
  const wanted = escolher && escolher in PLANS ? (escolher as PlanId) : null;

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-6 md:px-8">
      <PageHeader
        eyebrow="Assinatura"
        title="Planos"
        description={
          billing.appliesInstantly
            ? "Nesta versão não há cobrança: a troca de plano é aplicada na hora. A integração com Stripe ou outro gateway está preparada para depois."
            : "Pagamentos ainda não estão disponíveis. Fale com o suporte para mudar de plano."
        }
      />

      {wanted && wanted !== auth.org.plan && (
        <div className="rounded-2xl border border-brand/50 bg-brand/[0.07] px-5 py-4 text-sm">
          Você escolheu o plano <b>{PLANS[wanted].name}</b> no cadastro. Ative abaixo.
        </div>
      )}

      <Card className="p-5">
        <h2 className="font-semibold">Uso do plano {plan.name}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {rows.map((row) => {
            const pct = Math.min(100, Math.round((row.used / row.limit) * 100));
            return (
              <div key={row.label}>
                <div className="flex justify-between text-xs">
                  <span className="text-mute-2">{row.label}</span>
                  <span className="tabular-nums">
                    {row.used.toLocaleString("pt-BR")} / {row.limit.toLocaleString("pt-BR")}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-brand/15">
                  <div className={cn("h-full rounded-full", pct >= 80 ? "bg-brand" : "bg-brand/70")} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <PlanCards
        current={auth.org.plan}
        actions={{
          free: <PlanButton plan="free" current={auth.org.plan} canManage={canManage} />,
          pro: <PlanButton plan="pro" current={auth.org.plan} canManage={canManage} highlight={wanted === "pro"} />,
          business: <PlanButton plan="business" current={auth.org.plan} canManage={canManage} highlight={wanted === "business"} />,
        }}
      />
      {!canManage && <p className="text-center text-sm text-mute">Só o dono ou administradores da equipe podem mudar o plano.</p>}
    </div>
  );
}

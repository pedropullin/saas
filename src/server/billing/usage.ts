import "server-only";
import { and, eq, isNull, sql } from "drizzle-orm";
import { getPlan, type Plan } from "@/lib/plans";
import { getDb } from "../db/client";
import { usage } from "../db/schema";
import { PlanLimitError } from "../errors";
import { notifyAdmins } from "../notifications/service";

export function currentPeriod(date = new Date()): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export interface UsageSnapshot {
  period: string;
  searches: number;
  results: number;
  exports: number;
  enrichments: number;
}

export async function getUsage(orgId: string): Promise<UsageSnapshot> {
  const db = await getDb();
  const period = currentPeriod();
  const [row] = await db.select().from(usage).where(and(eq(usage.orgId, orgId), eq(usage.period, period))).limit(1);
  return { period, searches: row?.searches ?? 0, results: row?.results ?? 0, exports: row?.exports ?? 0, enrichments: row?.enrichments ?? 0 };
}

type Counter = "searches" | "results" | "exports" | "enrichments";

export async function addUsage(orgId: string, delta: Partial<Record<Counter, number>>): Promise<void> {
  const db = await getDb();
  const values = { searches: delta.searches ?? 0, results: delta.results ?? 0, exports: delta.exports ?? 0, enrichments: delta.enrichments ?? 0 };
  await db
    .insert(usage)
    .values({ orgId, period: currentPeriod(), ...values })
    .onConflictDoUpdate({
      target: [usage.orgId, usage.period],
      set: {
        searches: sql`${usage.searches} + ${values.searches}`,
        results: sql`${usage.results} + ${values.results}`,
        exports: sql`${usage.exports} + ${values.exports}`,
        enrichments: sql`${usage.enrichments} + ${values.enrichments}`,
      },
    });
}

/** Reserva `count` pesquisas do mês; recusa se passar do plano. Avisa os admins ao chegar em 80%. */
export async function consumeSearches(orgId: string, plan: Plan, count: number): Promise<void> {
  const current = await getUsage(orgId);
  if (current.searches + count > plan.searchesPerMonth) {
    throw new PlanLimitError(
      `Você usou ${current.searches} de ${plan.searchesPerMonth} pesquisas do plano ${plan.name} este mês. Mude de plano para continuar.`,
    );
  }
  await addUsage(orgId, { searches: count });
  const after = current.searches + count;
  if (after >= plan.searchesPerMonth * 0.8) {
    const db = await getDb();
    const updated = await db
      .update(usage)
      .set({ alertedAt: new Date() })
      .where(and(eq(usage.orgId, orgId), eq(usage.period, current.period), isNull(usage.alertedAt)))
      .returning({ orgId: usage.orgId });
    if (updated.length) {
      await notifyAdmins(orgId, null, "80% das pesquisas do mês já foram usadas", `${after} de ${plan.searchesPerMonth} no plano ${plan.name}.`, "/app/planos");
    }
  }
}

export function planFor(planId: string): Plan {
  return getPlan(planId);
}

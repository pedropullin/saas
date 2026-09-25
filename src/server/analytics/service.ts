import "server-only";
import { eq, sql } from "drizzle-orm";
import type { LeadStatus } from "@/lib/leads";
import { LEAD_STATUSES } from "@/lib/leads";
import { getDb } from "../db/client";
import { leads } from "../db/schema";
import { getUsage } from "../billing/usage";

const TZ = process.env.APP_TIMEZONE || "America/Sao_Paulo";

export interface DayPoint {
  day: string;
  leads: number;
  contacts: number;
  searches: number;
  found: number;
}

export interface DashboardData {
  foundThisMonth: number;
  foundTotal: number;
  searchesThisMonth: number;
  savedCompanies: number;
  leadsTotal: number;
  leadsContacted: number;
  leadsNegotiating: number;
  clients: number;
  contactRate: number | null;
  conversionRate: number | null;
  byStatus: Array<{ status: LeadStatus; count: number }>;
  series: DayPoint[];
}

function rows<T>(result: unknown): T[] {
  return (result as { rows: T[] }).rows;
}

export async function getDashboard(orgId: string): Promise<DashboardData> {
  const db = await getDb();
  const usage = await getUsage(orgId);

  const statusRows = await db
    .select({ status: leads.status, count: sql<number>`count(*)::int` })
    .from(leads)
    .where(eq(leads.orgId, orgId))
    .groupBy(leads.status);
  const byStatus = LEAD_STATUSES.map((s) => ({ status: s.id, count: statusRows.find((r) => r.status === s.id)?.count ?? 0 }));
  const leadsTotal = byStatus.reduce((sum, s) => sum + s.count, 0);

  const [totals] = rows<{ contacted: number; saved: number; found: number }>(
    await db.execute(sql`
      select
        (select count(*)::int from leads where org_id = ${orgId} and (first_contact_at is not null or status <> 'novo')) as contacted,
        (select count(*)::int from companies c where c.org_id = ${orgId} and (
          exists (select 1 from leads l where l.company_id = c.id)
          or exists (select 1 from list_items li where li.company_id = c.id)
          or exists (select 1 from favorites f where f.company_id = c.id))) as saved,
        (select coalesce(sum(result_count), 0)::int from searches where org_id = ${orgId}) as found
    `),
  );

  const series = rows<DayPoint>(
    await db.execute(sql`
      with days as (
        select generate_series((now() at time zone ${TZ})::date - 29, (now() at time zone ${TZ})::date, interval '1 day')::date as d
      )
      select to_char(d, 'YYYY-MM-DD') as day,
        (select count(*)::int from leads where org_id = ${orgId} and (created_at at time zone ${TZ})::date = d) as leads,
        (select count(*)::int from lead_events where org_id = ${orgId} and kind in ('whatsapp', 'ligacao') and (created_at at time zone ${TZ})::date = d) as contacts,
        (select count(*)::int from searches where org_id = ${orgId} and (created_at at time zone ${TZ})::date = d) as searches,
        (select coalesce(sum(result_count), 0)::int from searches where org_id = ${orgId} and (created_at at time zone ${TZ})::date = d) as found
      from days order by d
    `),
  );

  const contacted = totals?.contacted ?? 0;
  const clients = byStatus.find((s) => s.status === "cliente")?.count ?? 0;
  return {
    foundThisMonth: usage.results,
    foundTotal: totals?.found ?? 0,
    searchesThisMonth: usage.searches,
    savedCompanies: totals?.saved ?? 0,
    leadsTotal,
    leadsContacted: contacted,
    leadsNegotiating: byStatus.find((s) => s.status === "negociacao")?.count ?? 0,
    clients,
    contactRate: leadsTotal ? contacted / leadsTotal : null,
    conversionRate: contacted ? clients / contacted : null,
    byStatus,
    series,
  };
}

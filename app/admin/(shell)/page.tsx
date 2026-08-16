import type { Metadata } from "next";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { MetricTile } from "@/components/admin/MetricTile";
import { MiniLineChart } from "@/components/admin/charts/MiniLineChart";
import { MiniBarChart } from "@/components/admin/charts/MiniBarChart";
import { MiniDonut } from "@/components/admin/charts/MiniDonut";
import { adminMetrics } from "@/lib/mock/admin-metrics";

export const metadata: Metadata = { title: "Visão geral — Admin" };

export default function AdminOverviewPage() {
  const m = adminMetrics;

  return (
    <div className="mx-auto max-w-6xl">
      <Reveal>
        <p className="text-label font-medium uppercase tracking-[0.08em] text-neutral-500">
          Visão geral
        </p>
        <h1 className="mt-2 text-h1 font-medium text-ink">Painel administrativo</h1>
      </Reveal>

      <Stagger className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StaggerItem>
          <MetricTile label="Usuários totais" value={m.totalUsers} format="number" trend={`+${m.newUsersThisMonth} este mês`} />
        </StaggerItem>
        <StaggerItem>
          <MetricTile label="Identidades criadas" value={m.identitiesCreated} format="number" />
        </StaggerItem>
        <StaggerItem>
          <MetricTile label="Projetos ativos" value={m.activeProjects} format="number" />
        </StaggerItem>
        <StaggerItem>
          <MetricTile label="Designers ativos" value={m.activeDesigners} format="number" />
        </StaggerItem>
        <StaggerItem>
          <MetricTile label="Receita" value={m.revenue} format="currency" />
        </StaggerItem>
        <StaggerItem>
          <MetricTile label="Conversão" value={m.conversionRate} format="percent" />
        </StaggerItem>
        <StaggerItem>
          <MetricTile label="Novos usuários" value={m.newUsersThisMonth} format="number" />
        </StaggerItem>
        <StaggerItem>
          <MetricTile label="Ticket médio" value={Math.round(m.revenue / m.activeProjects)} format="currency" />
        </StaggerItem>
      </Stagger>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <Reveal className="rounded-md border border-ink/8 p-6">
          <p className="mb-6 text-[0.8125rem] font-medium text-ink">Usuários ao longo do tempo</p>
          <MiniLineChart data={m.usersOverTime} />
        </Reveal>
        <Reveal delay={0.06} className="rounded-md border border-ink/8 p-6">
          <p className="mb-6 text-[0.8125rem] font-medium text-ink">Receita mensal</p>
          <MiniBarChart data={m.revenueOverTime} />
        </Reveal>
      </div>

      <Reveal delay={0.1} className="mt-6 rounded-md border border-ink/8 p-6">
        <p className="mb-6 text-[0.8125rem] font-medium text-ink">Distribuição por plano</p>
        <MiniDonut data={m.planDistribution} />
      </Reveal>
    </div>
  );
}

import type { Metadata } from "next";
import { Reveal } from "@/components/motion/Reveal";
import { MiniLineChart } from "@/components/admin/charts/MiniLineChart";
import { MiniBarChart } from "@/components/admin/charts/MiniBarChart";
import { adminMetrics } from "@/lib/mock/admin-metrics";
import { formatPercent } from "@/lib/utils";

export const metadata: Metadata = { title: "Analytics — Admin" };

const FUNNEL = [
  { label: "Visitantes", value: 42800 },
  { label: "Iniciaram briefing", value: 9600 },
  { label: "Geraram identidade", value: 4100 },
  { label: "Assinaram", value: 1926 },
];

export default function AdminAnalyticsPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <Reveal>
        <p className="text-label font-medium uppercase tracking-[0.08em] text-neutral-500">
          Analytics
        </p>
        <h1 className="mt-2 text-h1 font-medium text-ink">Desempenho da plataforma</h1>
      </Reveal>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <Reveal className="rounded-md border border-ink/8 p-6">
          <p className="mb-6 text-[0.8125rem] font-medium text-ink">Crescimento de usuários</p>
          <MiniLineChart data={adminMetrics.usersOverTime} />
        </Reveal>
        <Reveal delay={0.06} className="rounded-md border border-ink/8 p-6">
          <p className="mb-6 text-[0.8125rem] font-medium text-ink">Receita mensal</p>
          <MiniBarChart data={adminMetrics.revenueOverTime} />
        </Reveal>
      </div>

      <Reveal delay={0.12} className="mt-6 rounded-md border border-ink/8 p-6">
        <p className="mb-6 text-[0.8125rem] font-medium text-ink">Funil de conversão</p>
        <div className="space-y-4">
          {FUNNEL.map((step, i) => {
            const first = FUNNEL[0];
            const pct = first ? (step.value / first.value) * 100 : 0;
            return (
              <div key={step.label}>
                <div className="mb-1.5 flex items-center justify-between text-[0.8125rem]">
                  <span className="text-ink">{step.label}</span>
                  <span className="text-neutral-500">
                    {step.value.toLocaleString("pt-BR")} · {formatPercent(pct)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className={i === FUNNEL.length - 1 ? "h-full rounded-full bg-accent" : "h-full rounded-full bg-ink"}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Reveal>
    </div>
  );
}

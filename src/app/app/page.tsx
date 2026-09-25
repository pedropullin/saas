import { ArrowRight, Kanban, MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { buttonClass } from "@/components/ui/button";
import { Avatar, Card } from "@/components/ui/misc";
import { getPlan } from "@/lib/plans";
import { SEARCH_EXAMPLES } from "@/lib/search";
import { cn } from "@/lib/utils";
import { recentActivity } from "@/server/activity/service";
import { getDashboard } from "@/server/analytics/service";
import { requirePageAuth } from "@/server/auth/session";

export const metadata: Metadata = { title: "Dashboard" };

function compact(value: number) {
  return value.toLocaleString("pt-BR", { notation: value >= 10_000 ? "compact" : "standard", maximumFractionDigits: 1 });
}

function ago(date: Date) {
  const minutes = Math.round((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export default async function DashboardPage() {
  const auth = await requirePageAuth();
  const [data, activity] = await Promise.all([getDashboard(auth.org.id), recentActivity(auth.org.id, 12)]);
  const plan = getPlan(auth.org.plan);
  const usagePct = Math.min(100, Math.round((data.searchesThisMonth / plan.searchesPerMonth) * 100));
  const tiles = [
    { label: "Empresas salvas", value: compact(data.savedCompanies), hint: "Em leads, listas ou favoritos" },
    { label: "Leads criados", value: compact(data.leadsTotal), hint: "Total no funil" },
    { label: "Leads contatados", value: compact(data.leadsContacted), hint: "Já saíram de “Novo”" },
    { label: "Em negociação", value: compact(data.leadsNegotiating), hint: "Conversas em andamento" },
    { label: "Clientes", value: compact(data.clients), hint: data.conversionRate != null ? `${Math.round(data.conversionRate * 100)}% dos contatados` : "Nenhum contato ainda" },
    { label: "Taxa de contato", value: data.contactRate != null ? `${Math.round(data.contactRate * 100)}%` : "—", hint: "Contatados ÷ leads" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">Dashboard</p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight md:text-3xl">Olá, {auth.user.name.split(" ")[0]}</h1>
          <p className="mt-1 text-sm text-mute">
            {auth.org.name} · plano {plan.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/app/leads" className={buttonClass("outline", "md")}>
            <Kanban size={16} /> Ver leads
          </Link>
          <Link href="/app/prospectar" className={buttonClass("primary", "md")}>
            <MagnifyingGlass size={16} /> Nova pesquisa
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_2fr]">
        <Card className="relative overflow-hidden p-6">
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand/20 blur-[70px]" aria-hidden="true" />
          <p className="relative text-sm text-mute-2">Empresas encontradas este mês</p>
          <p className="relative mt-2 text-6xl font-semibold tracking-tighter">{data.foundThisMonth.toLocaleString("pt-BR")}</p>
          <p className="relative mt-1 text-xs text-mute">{data.foundTotal.toLocaleString("pt-BR")} desde o início</p>
          <div className="relative mt-6">
            <div className="flex justify-between text-xs">
              <span className="text-mute-2">Pesquisas do mês</span>
              <span className="tabular-nums">
                {data.searchesThisMonth} de {plan.searchesPerMonth}
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-brand/15">
              <div className={cn("h-full rounded-full", usagePct >= 80 ? "bg-brand" : "bg-brand/70")} style={{ width: `${usagePct}%` }} />
            </div>
            {usagePct >= 80 && (
              <Link href="/app/planos" className="mt-2 inline-block text-xs font-medium text-brand hover:underline">
                Aumentar limite
              </Link>
            )}
          </div>
        </Card>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {tiles.map((tile) => (
            <Card key={tile.label} className="p-4 transition-colors hover:border-line-2">
              <p className="text-xs text-mute-2">{tile.label}</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight">{tile.value}</p>
              <p className="mt-1 truncate text-[11px] text-mute">{tile.hint}</p>
            </Card>
          ))}
        </div>
      </div>

      <DashboardCharts series={data.series} byStatus={data.byStatus} />

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Card className="p-5">
          <h2 className="text-sm font-semibold">Atividade recente da equipe</h2>
          {activity.length === 0 ? (
            <p className="mt-3 text-sm text-mute">Nada por aqui ainda. Faça uma pesquisa e salve os primeiros leads.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {activity.map((item) => (
                <li key={item.id} className="flex items-center gap-3 py-2.5">
                  <Avatar name={item.userName ?? "?"} src={item.userAvatar} size={28} />
                  <p className="min-w-0 flex-1 truncate text-sm">
                    <b className="font-medium">{item.userName ?? "Alguém"}</b> <span className="text-mute-2">{item.summary}</span>
                  </p>
                  <span className="shrink-0 text-xs text-mute">{ago(item.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card className="p-5">
          <h2 className="text-sm font-semibold">Comece uma pesquisa</h2>
          <ul className="mt-3 space-y-2">
            {SEARCH_EXAMPLES.map((example) => (
              <li key={example}>
                <Link
                  href={`/app/prospectar?q=${encodeURIComponent(example)}`}
                  className="group flex items-center justify-between rounded-xl border border-line px-4 py-3 text-sm transition-colors hover:border-brand/60"
                >
                  {example}
                  <ArrowRight size={14} className="text-mute transition-transform group-hover:translate-x-0.5 group-hover:text-brand" />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

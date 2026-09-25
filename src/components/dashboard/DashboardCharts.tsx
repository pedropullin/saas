"use client";

import { ColumnChart, type ColumnDatum } from "@/components/charts/ColumnChart";
import { FunnelBars } from "@/components/charts/FunnelBars";
import { Card } from "@/components/ui/misc";
import { STATUS_LABEL, type LeadStatus } from "@/lib/leads";

interface Point {
  day: string;
  leads: number;
  contacts: number;
  searches: number;
  found: number;
}

function label(day: string) {
  const [, m, d] = day.split("-");
  return `${d}/${m}`;
}

export function DashboardCharts({ series, byStatus }: { series: Point[]; byStatus: Array<{ status: LeadStatus; count: number }> }) {
  const make = (key: "found" | "leads" | "contacts"): ColumnDatum[] => series.map((p) => ({ key: p.day, label: label(p.day), value: p[key] }));
  const sum = (key: "found" | "leads" | "contacts") => series.reduce((s, p) => s + p[key], 0);
  const charts = [
    { key: "found" as const, title: "Empresas encontradas", unit: "empresas" },
    { key: "leads" as const, title: "Leads criados", unit: "leads" },
    { key: "contacts" as const, title: "Contatos feitos", unit: "contatos" },
  ];

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-3">
        {charts.map((chart) => (
          <Card key={chart.key} className="p-5">
            <div className="mb-3 flex items-baseline justify-between gap-2">
              <h3 className="text-sm font-semibold">{chart.title}</h3>
              <span className="text-xs text-mute">
                <b className="text-paper">{sum(chart.key).toLocaleString("pt-BR")}</b> em 30 dias
              </span>
            </div>
            <ColumnChart data={make(chart.key)} title={chart.title} unit={chart.unit} />
          </Card>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Card className="p-5">
          <h3 className="text-sm font-semibold">Funil de leads</h3>
          <p className="mb-4 text-xs text-mute">Quantidade de leads em cada etapa agora.</p>
          <FunnelBars data={byStatus.map((s) => ({ key: s.status, label: STATUS_LABEL[s.status], value: s.count }))} />
        </Card>
        <Card className="p-5">
          <details>
            <summary className="cursor-pointer text-sm font-semibold">Ver dados em tabela (30 dias)</summary>
            <div className="mt-3 max-h-72 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-ink-3 text-mute">
                  <tr>
                    <th className="py-1.5 font-medium">Dia</th>
                    <th className="py-1.5 text-right font-medium">Encontradas</th>
                    <th className="py-1.5 text-right font-medium">Leads</th>
                    <th className="py-1.5 text-right font-medium">Contatos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line tabular-nums">
                  {[...series].reverse().map((p) => (
                    <tr key={p.day}>
                      <td className="py-1.5">{label(p.day)}</td>
                      <td className="py-1.5 text-right">{p.found}</td>
                      <td className="py-1.5 text-right">{p.leads}</td>
                      <td className="py-1.5 text-right">{p.contacts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </Card>
      </div>
    </>
  );
}

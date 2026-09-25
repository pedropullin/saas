"use client";

import { ArrowClockwise, ClockCounterClockwise, Trash } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DEFAULT_FORM, searchActions, type SearchForm } from "@/client/search-store";
import { toast } from "@/client/toast";
import { buttonClass } from "@/components/ui/button";
import { DemoBadge, EmptyState } from "@/components/ui/misc";
import { deleteHistoryAction } from "@/server/history/actions";

interface Entry {
  id: string;
  query: string;
  params: Record<string, unknown>;
  resultCount: number;
  provider: string;
  createdAt: string;
}

function toForm(params: Record<string, unknown>): SearchForm {
  const str = (key: string) => (typeof params[key] === "string" ? (params[key] as string) : "");
  const scope = params.scope === "raio" || params.scope === "mundial" ? params.scope : "local";
  const sweep = params.sweep === 2 || params.sweep === 3 ? params.sweep : 1;
  return {
    ...DEFAULT_FORM,
    q: str("q"),
    category: str("category"),
    customCategory: str("customCategory"),
    scope,
    country: str("country"),
    state: str("state"),
    city: str("city"),
    neighborhood: str("neighborhood"),
    postalCode: str("postalCode"),
    radiusKm: typeof params.radiusKm === "number" ? params.radiusKm : DEFAULT_FORM.radiusKm,
    sweep,
  };
}

function groupLabel(iso: string) {
  const date = new Date(iso);
  const today = new Date();
  const diff = Math.floor((new Date(today.toDateString()).getTime() - new Date(date.toDateString()).getTime()) / 86_400_000);
  if (diff === 0) return "Hoje";
  if (diff === 1) return "Ontem";
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: date.getFullYear() === today.getFullYear() ? undefined : "numeric" });
}

export function HistoryList({ entries: initial }: { entries: Entry[] }) {
  const router = useRouter();
  const [entries, setEntries] = useState(initial);

  if (!entries.length) {
    return <EmptyState icon={<ClockCounterClockwise size={22} />} title="Nenhuma pesquisa ainda" description="Suas pesquisas aparecem aqui para repetir com um clique." />;
  }

  const groups = entries.reduce<Record<string, Entry[]>>((acc, entry) => {
    (acc[groupLabel(entry.createdAt)] ??= []).push(entry);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={async () => {
            if (!confirm("Apagar todo o seu histórico de pesquisas?")) return;
            const result = await deleteHistoryAction();
            if (!result.ok) return toast.error(result.error);
            setEntries([]);
          }}
          className={buttonClass("ghost", "sm")}
        >
          <Trash size={15} /> Limpar histórico
        </button>
      </div>
      {Object.entries(groups).map(([label, group]) => (
        <section key={label}>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-mute">{label}</h2>
          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line">
            {group.map((entry) => (
              <li key={entry.id} className="flex items-center gap-3 bg-ink-2 px-4 py-3.5">
                <ClockCounterClockwise size={18} className="shrink-0 text-mute" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{entry.query}</p>
                  <p className="text-xs text-mute">
                    {entry.resultCount} empresas encontradas · {new Date(entry.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    {entry.provider === "demo" && <DemoBadge className="ml-2" />}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    searchActions.setForm(toForm(entry.params));
                    router.push("/app/prospectar?auto=1");
                  }}
                  className={buttonClass("outline", "sm")}
                >
                  <ArrowClockwise size={15} /> Repetir
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const result = await deleteHistoryAction(entry.id);
                    if (!result.ok) return toast.error(result.error);
                    setEntries((all) => all.filter((e) => e.id !== entry.id));
                  }}
                  className={buttonClass("ghost", "icon-sm")}
                  aria-label="Apagar do histórico"
                >
                  <Trash size={15} />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

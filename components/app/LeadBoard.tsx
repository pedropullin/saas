"use client";

import {
  ArrowRight,
  DownloadSimple,
  GoogleLogo,
  MagnifyingGlass,
  NotePencil,
  ShareNetwork,
  Trash,
  UploadSimple,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { buttonClass } from "@/components/ui/button";
import { Stars } from "@/components/ui/Stars";
import { downloadCsv, PLACE_CSV_HEADER, placeCsvRow, toCsv } from "@/lib/csv";
import {
  importLeads,
  LEAD_STATUSES,
  removeLead,
  STATUS_LABEL,
  updateLead,
  useLeads,
  type Lead,
  type LeadStatus,
} from "@/lib/leads";
import { toast } from "@/lib/toast";
import { cn, formatCount, formatDate, formatRating } from "@/lib/utils";
import { WhatsAppChip } from "./Badges";
import { CallButton, WhatsAppButton } from "./ContactButtons";
import { PlaceDetailsPanel } from "./PlaceDetailsPanel";

type Tab = LeadStatus | "todos";

export function LeadBoard() {
  const leadsMap = useLeads();
  const [tab, setTab] = useState<Tab>("todos");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [notesOpen, setNotesOpen] = useState<Set<string>>(new Set());
  const fileRef = useRef<HTMLInputElement>(null);

  const leads = useMemo(
    () => Object.values(leadsMap).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [leadsMap],
  );

  const counts = useMemo(() => {
    const result: Record<Tab, number> = { todos: leads.length, novo: 0, contatado: 0, respondeu: 0, negociando: 0, fechado: 0, perdido: 0 };
    for (const lead of leads) result[lead.status]++;
    return result;
  }, [leads]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter((lead) => {
      if (tab !== "todos" && lead.status !== tab) return false;
      if (!q) return true;
      const { place } = lead;
      return [place.name, place.category, place.city, place.address, lead.notes]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(q));
    });
  }, [leads, tab, query]);

  const openLead = openId ? leadsMap[openId] : undefined;

  function exportCsv() {
    const header = [...PLACE_CSV_HEADER, "Status", "Anotações", "Adicionado por", "Último contato", "Nº de contatos"];
    const rows = filtered.map((lead) => [
      ...placeCsvRow(lead.place),
      STATUS_LABEL[lead.status],
      lead.notes,
      lead.addedBy,
      lead.lastContactAt ? new Date(lead.lastContactAt).toLocaleString("pt-BR") : null,
      lead.contactCount,
    ]);
    downloadCsv(`prospecta-lista-${new Date().toISOString().slice(0, 10)}.csv`, toCsv([header, ...rows]));
    toast(`${filtered.length} leads exportados em CSV.`);
  }

  function exportBackup() {
    const blob = new Blob([JSON.stringify({ app: "prospecta.ai", version: 1, leads: leadsMap }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `prospecta-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast("Backup baixado. Envie o arquivo para um amigo importar.");
  }

  async function importBackup(file: File) {
    try {
      const data = JSON.parse(await file.text());
      const changed = importLeads(data?.leads ?? data);
      toast(changed ? `${changed} leads importados.` : "Nada novo nesse arquivo.");
    } catch {
      toast("Arquivo inválido. Use um backup exportado pelo Prospecta.", "error");
    }
  }

  function toggleNotes(id: string) {
    setNotesOpen((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <main className="relative flex min-h-0 flex-1">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-4 pb-24 pt-8 md:px-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">Funil de prospecção</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Minha lista</h1>
              <p className="mt-2 max-w-lg text-sm text-mute">
                Fica salva neste navegador. Para juntar com a lista de um amigo, exporte o backup e peça para ele importar.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => fileRef.current?.click()} className={buttonClass("ghost", "sm")}>
                <UploadSimple size={15} /> Importar
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void importBackup(file);
                  event.target.value = "";
                }}
              />
              <button type="button" onClick={exportBackup} disabled={!leads.length} className={buttonClass("ghost", "sm")}>
                <ShareNetwork size={15} /> Backup para amigo
              </button>
              <button type="button" onClick={exportCsv} disabled={!filtered.length} className={buttonClass("outline", "sm")}>
                <DownloadSimple size={15} /> Exportar CSV
              </button>
            </div>
          </div>

          {leads.length === 0 ? (
            <div className="mt-12 rounded-3xl border border-dashed border-line-2 px-6 py-20 text-center">
              <p className="text-xl font-semibold">Sua lista está vazia</p>
              <p className="mx-auto mt-2 max-w-md text-sm text-mute">
                Salve empresas pelo marcador nos resultados ou chame alguém no WhatsApp: elas aparecem aqui com status e
                anotações.
              </p>
              <Link href="/prospectar" className={buttonClass("primary", "lg", "mt-7")}>
                Começar a prospectar <ArrowRight size={17} weight="bold" />
              </Link>
            </div>
          ) : (
            <>
              <div className="mt-8 grid grid-cols-3 gap-2 sm:grid-cols-7">
                {(["todos", ...LEAD_STATUSES.map((s) => s.id)] as Tab[]).map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTab(id)}
                    aria-pressed={tab === id}
                    className={cn(
                      "rounded-xl border px-3 py-3 text-left transition-colors",
                      tab === id
                        ? id === "fechado"
                          ? "border-brand bg-brand text-white"
                          : "border-paper bg-paper text-ink"
                        : "border-line hover:border-line-2 hover:bg-white/[0.02]",
                    )}
                  >
                    <span className="block text-2xl font-semibold tabular-nums tracking-tight">{counts[id]}</span>
                    <span className={cn("text-xs", tab === id ? "" : "text-mute")}>{id === "todos" ? "Todos" : STATUS_LABEL[id]}</span>
                  </button>
                ))}
              </div>

              <label className="mt-6 flex h-11 items-center gap-2.5 rounded-xl border border-line-2 bg-ink-2 px-3.5 focus-within:border-brand">
                <MagnifyingGlass size={17} className="text-mute" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Filtrar por nome, cidade, segmento ou anotação"
                  className="h-full flex-1 bg-transparent text-sm outline-none placeholder:text-mute"
                />
              </label>

              <ul className="mt-4 divide-y divide-line overflow-hidden rounded-2xl border border-line">
                {filtered.map((lead) => (
                  <LeadRow
                    key={lead.place.id}
                    lead={lead}
                    notesOpen={notesOpen.has(lead.place.id)}
                    onToggleNotes={() => toggleNotes(lead.place.id)}
                    onOpen={() => setOpenId(lead.place.id)}
                  />
                ))}
                {!filtered.length && <li className="px-6 py-12 text-center text-sm text-mute">Nada por aqui com esse filtro.</li>}
              </ul>
            </>
          )}
        </div>
      </div>
      {openLead && <PlaceDetailsPanel place={openLead.place} lead={openLead} onClose={() => setOpenId(null)} />}
    </main>
  );
}

function LeadRow({ lead, notesOpen, onToggleNotes, onOpen }: { lead: Lead; notesOpen: boolean; onToggleNotes: () => void; onOpen: () => void }) {
  const { place } = lead;
  return (
    <li className="bg-ink-2/40">
      <div className="grid gap-4 px-4 py-4 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_212px_150px] md:items-center md:px-5">
        <div className="min-w-0">
          <button type="button" onClick={onOpen} className="block max-w-full truncate text-left text-[15px] font-semibold tracking-tight hover:text-brand">
            {place.name}
            {place.demo && <span className="ml-2 rounded bg-brand px-1.5 py-0.5 align-middle text-[10px] text-white">DEMO</span>}
          </button>
          <p className="mt-0.5 truncate text-[13px] text-mute">{[place.category, place.city].filter(Boolean).join(" · ") || place.address}</p>
          <p className="mt-1 text-[11px] text-mute">
            {lead.addedBy ? `Por ${lead.addedBy} · ` : ""}
            {lead.lastContactAt ? `último contato ${formatDate(lead.lastContactAt)}` : `salvo ${formatDate(lead.addedAt)}`}
            {lead.contactCount > 0 && ` · ${lead.contactCount}×`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {place.rating != null && (
            <span className="inline-flex items-center gap-1.5 text-[13px]">
              <span className="font-semibold tabular-nums">{formatRating(place.rating)}</span>
              <Stars value={place.rating} size={12} />
              <span className="text-mute tabular-nums">({formatCount(place.reviewCount)})</span>
            </span>
          )}
          <WhatsAppChip place={place} />
        </div>

        <div className="flex items-center gap-1.5 md:justify-end">
          <WhatsAppButton place={place} size="icon" label={null} />
          <CallButton place={place} size="icon" label={null} />
          {place.mapsUrl && (
            <a href={place.mapsUrl} target="_blank" rel="noopener noreferrer" className={buttonClass("outline", "icon")} aria-label="Abrir no Google Maps" title="Abrir no Google Maps">
              <GoogleLogo size={16} weight="bold" />
            </a>
          )}
          <button type="button" onClick={onToggleNotes} aria-expanded={notesOpen} className={buttonClass(lead.notes ? "outline" : "ghost", "icon", lead.notes && "border-brand/60 text-brand")} aria-label="Anotações" title="Anotações">
            <NotePencil size={16} />
          </button>
          <button
            type="button"
            onClick={() => {
              removeLead(place.id);
              toast(`${place.name} saiu da lista.`);
            }}
            className={buttonClass("ghost", "icon")}
            aria-label="Remover da lista"
            title="Remover da lista"
          >
            <Trash size={16} />
          </button>
        </div>

        <select
          value={lead.status}
          onChange={(event) => updateLead(place.id, { status: event.target.value as LeadStatus })}
          aria-label="Status"
          className={cn(
            "h-9 w-full cursor-pointer rounded-lg border px-3 text-sm font-medium outline-none",
            lead.status === "fechado" && "border-brand bg-brand text-white",
            lead.status === "perdido" && "border-line bg-transparent text-mute line-through",
            !["fechado", "perdido"].includes(lead.status) && "border-line-2 bg-ink text-paper",
          )}
        >
          {LEAD_STATUSES.map((status) => (
            <option key={status.id} value={status.id} className="bg-ink text-paper no-underline">
              {status.label}
            </option>
          ))}
        </select>
      </div>
      {notesOpen && (
        <div className="px-4 pb-4 md:px-5">
          <textarea
            value={lead.notes}
            onChange={(event) => updateLead(place.id, { notes: event.target.value })}
            placeholder="Com quem falou, objeções, próximo passo, valor da proposta…"
            rows={3}
            autoFocus
            className="w-full resize-y rounded-xl border border-line-2 bg-ink p-3 text-sm outline-none placeholder:text-mute focus:border-brand"
          />
        </div>
      )}
    </li>
  );
}

"use client";

import { DownloadSimple, Kanban, Phone, SpinnerGap, Trash, WhatsappLogo } from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";
import { saveLeads } from "@/client/company-actions";
import { toast } from "@/client/toast";
import { CompanyPhoto, LeadChip } from "@/components/prospect/bits";
import { useContact } from "@/components/prospect/useContact";
import { useApp } from "@/components/shell/AppContext";
import { buttonClass } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/form";
import { DemoBadge } from "@/components/ui/misc";
import { Stars } from "@/components/ui/Stars";
import { downloadCsv, PLACE_CSV_HEADER, placeCsvRow, toCsv } from "@/lib/csv";
import type { LeadStatus } from "@/lib/leads";
import type { Enrichment, Place, ResultPlace } from "@/lib/types";
import { formatCount, formatRating } from "@/lib/utils";
import { authorizeExportAction } from "@/server/billing/actions";

export interface CompanyItem {
  companyId: string;
  placeId: string | null;
  source: string;
  place: Place;
  enrichment: Enrichment | null;
  leadId: string | null;
  leadStatus: string | null;
  addedAt: string;
}

function asResult(item: CompanyItem): ResultPlace {
  return {
    ...item.place,
    distanceKm: null,
    enrichment: item.enrichment,
    saved: { companyId: item.companyId, leadId: item.leadId, leadStatus: item.leadStatus as LeadStatus | null, favorite: false, listIds: [] },
  };
}

function Row({ item, selected, onSelect, onRemove, onLead }: { item: CompanyItem; selected: boolean; onSelect: (v: boolean) => void; onRemove: () => void; onLead: (leadId: string) => void }) {
  const place = asResult(item);
  const contact = useContact(place);
  const waHref = contact.whatsappHref();
  const [busy, setBusy] = useState(false);
  const linkable = item.placeId && item.source !== "import";
  return (
    <li className="flex flex-col gap-3 bg-ink-2 px-4 py-3.5 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Checkbox checked={selected} onChange={onSelect} label={<span className="sr-only">Selecionar {place.name}</span>} />
        <CompanyPhoto place={place} size={44} />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {linkable ? (
              <Link href={`/app/empresa/${encodeURIComponent(item.placeId!)}`} className="truncate font-medium hover:text-brand">
                {place.name}
              </Link>
            ) : (
              <span className="truncate font-medium">{place.name}</span>
            )}
            {place.demo && <DemoBadge />}
          </div>
          <p className="truncate text-xs text-mute">{[place.category, place.city].filter(Boolean).join(" · ") || "—"}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
            {place.rating != null ? (
              <span className="inline-flex items-center gap-1">
                <b>{formatRating(place.rating)}</b> <Stars value={place.rating} size={11} /> <span className="text-mute">({formatCount(place.reviewCount ?? 0)})</span>
              </span>
            ) : (
              <span className="text-mute">Avaliações não encontradas</span>
            )}
            <LeadChip status={item.leadStatus as LeadStatus | null} />
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-1.5 pl-8 sm:pl-0">
        {waHref && (
          <a href={waHref} target="_blank" rel="noopener noreferrer" onClick={contact.onWhatsApp} className={buttonClass("primary", "sm")}>
            <WhatsappLogo size={15} weight="fill" /> WhatsApp
          </a>
        )}
        {contact.telHref && (
          <a href={contact.telHref} onClick={contact.onCall} className={buttonClass("light", "sm")}>
            <Phone size={14} weight="fill" /> Ligar
          </a>
        )}
        {!item.leadId && (
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              const result = await saveLeads([place]);
              setBusy(false);
              const leadId = result?.leadIds[place.id];
              if (leadId) onLead(leadId);
            }}
            className={buttonClass("outline", "sm")}
          >
            {busy ? <SpinnerGap size={14} className="animate-spin" /> : <Kanban size={15} />} Lead
          </button>
        )}
        <button type="button" onClick={onRemove} className={buttonClass("ghost", "icon-sm")} aria-label={`Remover ${place.name}`} title="Remover">
          <Trash size={15} />
        </button>
      </div>
    </li>
  );
}

export function CompanyTable({ items: initial, onRemove, filename }: { items: CompanyItem[]; onRemove: (companyIds: string[]) => Promise<boolean>; filename: string }) {
  const { plan } = useApp();
  const [items, setItems] = useState(initial);
  const [selection, setSelection] = useState<Set<string>>(new Set());
  const chosen = items.filter((i) => selection.has(i.companyId));

  async function remove(ids: string[]) {
    if (await onRemove(ids)) {
      setItems((all) => all.filter((i) => !ids.includes(i.companyId)));
      setSelection(new Set());
    }
  }

  async function exportCsv() {
    const target = chosen.length ? chosen : items;
    const allowed = await authorizeExportAction(target.length);
    if (!allowed.ok) return toast.error(allowed.error);
    downloadCsv(`${filename}.csv`, toCsv([PLACE_CSV_HEADER, ...target.map((i) => placeCsvRow(i.place, i.enrichment))]));
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Checkbox checked={items.length > 0 && chosen.length === items.length} onChange={(c) => setSelection(c ? new Set(items.map((i) => i.companyId)) : new Set())} label={chosen.length ? `${chosen.length} selecionadas` : "Selecionar todas"} />
        <div className="ml-auto flex flex-wrap gap-2">
          {chosen.length > 0 && (
            <>
              <button
                type="button"
                onClick={async () => {
                  const result = await saveLeads(chosen.map(asResult));
                  if (result) setItems((all) => all.map((i) => (result.leadIds[i.place.id] ? { ...i, leadId: result.leadIds[i.place.id]!, leadStatus: i.leadStatus ?? "novo" } : i)));
                }}
                className={buttonClass("primary", "sm")}
              >
                <Kanban size={15} /> Adicionar {chosen.length} aos leads
              </button>
              <button type="button" onClick={() => remove(chosen.map((i) => i.companyId))} className={buttonClass("outline", "sm")}>
                <Trash size={15} /> Remover
              </button>
            </>
          )}
          <button type="button" onClick={exportCsv} className={buttonClass("outline", "sm")} title={plan.export ? "Exportar CSV" : "Exportação no plano Pro"}>
            <DownloadSimple size={15} /> Exportar {chosen.length ? "selecionadas" : "CSV"}
          </button>
        </div>
      </div>
      <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line">
        {items.map((item) => (
          <Row
            key={item.companyId}
            item={item}
            selected={selection.has(item.companyId)}
            onSelect={(v) =>
              setSelection((s) => {
                const next = new Set(s);
                if (v) next.add(item.companyId);
                else next.delete(item.companyId);
                return next;
              })
            }
            onRemove={() => remove([item.companyId])}
            onLead={(leadId) => setItems((all) => all.map((i) => (i.companyId === item.companyId ? { ...i, leadId, leadStatus: "novo" } : i)))}
          />
        ))}
      </ul>
    </div>
  );
}

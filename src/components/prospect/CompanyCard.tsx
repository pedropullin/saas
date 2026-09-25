"use client";

import { ArrowRight, BookmarkSimple, Clock, Globe, Lightning, MapPin, Phone, Plus, SpinnerGap, WhatsappLogo } from "@phosphor-icons/react";
import Link from "next/link";
import { forwardRef, useState } from "react";
import { saveLeads, toggleFavorite } from "@/client/company-actions";
import { buttonClass } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/form";
import { DemoBadge } from "@/components/ui/misc";
import { Stars } from "@/components/ui/Stars";
import { hasFact } from "@/lib/contact";
import { formatDistance } from "@/lib/geo";
import type { ResultPlace } from "@/lib/types";
import { cn, formatCount, formatRating } from "@/lib/utils";
import { AddToListMenu } from "./AddToListMenu";
import { CompanyPhoto, factText, LeadChip, OpenNowChip, SiteChip, todayHours, WhatsAppChip } from "./bits";
import { useContact } from "./useContact";

interface CompanyCardProps {
  place: ResultPlace;
  index: number;
  active: boolean;
  selected: boolean;
  onSelect: (checked: boolean) => void;
  onHover: () => void;
  onProspect: () => void;
}

export const CompanyCard = forwardRef<HTMLElement, CompanyCardProps>(function CompanyCard(
  { place, index, active, selected, onSelect, onHover, onProspect },
  ref,
) {
  const contact = useContact(place);
  const { facts } = contact;
  const [busy, setBusy] = useState<"fav" | "lead" | null>(null);
  const href = `/app/empresa/${encodeURIComponent(place.id)}`;
  const hours = todayHours(place);
  const noSite = !hasFact(facts.website);
  const waHref = contact.whatsappHref();

  async function addLead(event: React.MouseEvent) {
    event.stopPropagation();
    setBusy("lead");
    await saveLeads([place]);
    setBusy(null);
  }

  return (
    <article
      ref={ref}
      onMouseEnter={onHover}
      className={cn(
        "group relative border-b border-line px-4 py-4 transition-colors md:px-5",
        active ? "bg-white/[0.04]" : "hover:bg-white/[0.02]",
        selected && "bg-brand/[0.05]",
      )}
    >
      {active && <span className="absolute inset-y-0 left-0 w-[3px] bg-brand" aria-hidden="true" />}
      <div className="flex gap-3">
        <div className="flex flex-col items-center gap-2 pt-0.5">
          <Checkbox checked={selected} onChange={onSelect} label={<span className="sr-only">Selecionar {place.name}</span>} />
          <span className={cn("grid h-6 min-w-6 place-items-center rounded-full px-1 text-[11px] font-bold tabular-nums", active ? "bg-paper text-ink" : "bg-brand text-white")}>{index}</span>
        </div>
        <CompanyPhoto place={place} size={60} className="hidden sm:grid sm:object-cover" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link href={href} className="block truncate text-[15px] font-semibold tracking-tight hover:text-brand">
                {place.name}
              </Link>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[13px] text-mute">
                <span>{place.category ?? "Categoria não encontrada"}</span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-0.5">
                  <MapPin size={12} />
                  {place.neighborhood ? `${place.neighborhood}, ` : ""}
                  {place.city ?? "Cidade não encontrada"}
                </span>
                {place.distanceKm != null && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{formatDistance(place.distanceKm)}</span>
                  </>
                )}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {place.demo && <DemoBadge />}
              <button
                type="button"
                onClick={async (e) => {
                  e.stopPropagation();
                  setBusy("fav");
                  await toggleFavorite(place);
                  setBusy(null);
                }}
                aria-pressed={place.saved.favorite}
                aria-label={place.saved.favorite ? "Remover dos favoritos" : "Salvar nos favoritos"}
                title={place.saved.favorite ? "Salvo nos favoritos" : "Salvar"}
                className={cn("grid h-8 w-8 place-items-center rounded-lg transition-colors", place.saved.favorite ? "text-brand" : "text-mute hover:bg-white/5 hover:text-paper")}
              >
                {busy === "fav" ? <SpinnerGap size={16} className="animate-spin" /> : <BookmarkSimple size={18} weight={place.saved.favorite ? "fill" : "regular"} />}
              </button>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px]">
            {place.rating != null ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="font-semibold tabular-nums">{formatRating(place.rating)}</span>
                <Stars value={place.rating} size={13} />
                <span className="text-mute tabular-nums">{formatCount(place.reviewCount ?? 0)} avaliações</span>
              </span>
            ) : (
              <span className="text-mute">Avaliações: não encontrado</span>
            )}
            {hours && (
              <span className="inline-flex items-center gap-1 text-mute">
                <Clock size={13} /> Hoje: {hours}
              </span>
            )}
          </div>

          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <LeadChip status={place.saved.leadStatus} />
            <SiteChip facts={facts} />
            <WhatsAppChip facts={facts} />
            <OpenNowChip place={place} />
          </div>

          <dl className="mt-2.5 grid grid-cols-1 gap-x-4 gap-y-0.5 text-[12px] sm:grid-cols-2">
            {(
              [
                ["Telefone", factText(facts.phone, "phone")],
                ["Website", factText(facts.website, "site")],
                ["Instagram", factText(facts.instagram, "instagram")],
                ["E-mail", factText(facts.email, "email")],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="flex min-w-0 gap-1.5">
                <dt className="shrink-0 text-mute">{label}:</dt>
                <dd className={cn("truncate", value === "Não encontrado" ? "text-mute/70" : value === "Verificando…" ? "text-mute" : "text-mute-2")}>{value}</dd>
              </div>
            ))}
          </dl>

          {noSite && place.status !== "CLOSED_PERMANENTLY" && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-brand/40 bg-brand/[0.07] px-3 py-2.5">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand">Oportunidade</p>
                <p className="text-[13px] text-mute-2">Esta empresa não possui website identificado.</p>
              </div>
              {!place.saved.leadId && (
                <button type="button" onClick={addLead} disabled={busy !== null} className={buttonClass("primary", "sm")}>
                  {busy === "lead" ? <SpinnerGap size={14} className="animate-spin" /> : <Plus size={14} weight="bold" />} Adicionar aos leads
                </button>
              )}
            </div>
          )}

          <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            {waHref ? (
              <a href={waHref} target="_blank" rel="noopener noreferrer" onClick={contact.onWhatsApp} className={buttonClass(contact.whatsapp?.confidence === "possivel" ? "danger" : "primary", "lg", "sm:h-8 sm:rounded-lg sm:px-3 sm:text-[13px]")}>
                <WhatsappLogo size={18} weight="fill" /> WhatsApp
              </a>
            ) : (
              <span className={buttonClass("outline", "lg", "pointer-events-none opacity-40 sm:h-8 sm:rounded-lg sm:px-3 sm:text-[13px]")}>Sem WhatsApp</span>
            )}
            {contact.telHref ? (
              <a href={contact.telHref} onClick={contact.onCall} className={buttonClass("light", "lg", "sm:h-8 sm:rounded-lg sm:px-3 sm:text-[13px]")}>
                <Phone size={17} weight="fill" /> Ligar
              </a>
            ) : (
              <span className={buttonClass("outline", "lg", "pointer-events-none opacity-40 sm:h-8 sm:rounded-lg sm:px-3 sm:text-[13px]")}>Sem telefone</span>
            )}
            <div className="col-span-2 flex flex-wrap gap-2 sm:contents">
              {hasFact(facts.website) && (
                <a href={facts.website.value} target="_blank" rel="noopener noreferrer" className={buttonClass("outline", "sm")}>
                  <Globe size={15} /> Site
                </a>
              )}
              <AddToListMenu places={[place]} />
              {!place.saved.leadId && !noSite && (
                <button type="button" onClick={addLead} disabled={busy !== null} className={buttonClass("outline", "sm")} title="Adicionar aos leads">
                  {busy === "lead" ? <SpinnerGap size={14} className="animate-spin" /> : <Plus size={14} />} Lead
                </button>
              )}
              <button type="button" onClick={onProspect} className={buttonClass("outline", "sm")}>
                <Lightning size={15} weight="fill" className="text-brand" /> Prospectar
              </button>
              <Link href={href} className={buttonClass("ghost", "sm", "ml-auto")}>
                Ver empresa <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
});

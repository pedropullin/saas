"use client";

import { BookmarkSimple, MapPin } from "@phosphor-icons/react";
import { forwardRef } from "react";
import { Stars } from "@/components/ui/Stars";
import { removeLead, saveLead, STATUS_LABEL, type Lead } from "@/lib/leads";
import { toast } from "@/lib/toast";
import type { Place } from "@/lib/types";
import { cn, formatCount, formatRating } from "@/lib/utils";
import { useMyName } from "./AppSession";
import { OpenChip, WebsiteChip, WhatsAppChip } from "./Badges";
import { CallButton, WhatsAppButton } from "./ContactButtons";

interface ResultCardProps {
  place: Place;
  index: number;
  lead: Lead | undefined;
  active: boolean;
  onOpen: () => void;
  onHover: () => void;
}

export const ResultCard = forwardRef<HTMLElement, ResultCardProps>(function ResultCard(
  { place, index, lead, active, onOpen, onHover },
  ref,
) {
  const myName = useMyName();

  function toggleSave(event: React.MouseEvent) {
    event.stopPropagation();
    if (lead) {
      removeLead(place.id);
      toast(`${place.name} saiu da sua lista.`);
    } else {
      saveLead(place, myName || null);
      toast(`${place.name} foi salva na sua lista.`);
    }
  }

  return (
    <article
      ref={ref}
      onMouseEnter={onHover}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" && event.target === event.currentTarget) onOpen();
      }}
      tabIndex={0}
      aria-label={`${index}. ${place.name}`}
      className={cn(
        "group relative cursor-pointer border-b border-line px-4 py-4 outline-none transition-colors md:px-5",
        active ? "bg-white/[0.045]" : "hover:bg-white/[0.025] focus-visible:bg-white/[0.035]",
      )}
    >
      {active && <span className="absolute inset-y-0 left-0 w-[3px] bg-brand" aria-hidden="true" />}
      <div className="flex gap-3.5">
        <span
          className={cn(
            "mt-0.5 grid h-7 min-w-7 shrink-0 place-items-center rounded-full px-1.5 text-xs font-bold tabular-nums",
            active ? "bg-paper text-ink" : lead ? "border border-brand text-brand" : "bg-brand text-white",
          )}
        >
          {index}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-[15px] font-semibold tracking-tight">{place.name}</h3>
              <p className="mt-0.5 flex items-center gap-1 truncate text-[13px] text-mute">
                {place.category && <span className="truncate">{place.category}</span>}
                {place.category && place.city && <span aria-hidden="true">·</span>}
                {place.city && (
                  <span className="inline-flex items-center gap-0.5 truncate">
                    <MapPin size={12} className="shrink-0" />
                    {place.city}
                  </span>
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={toggleSave}
              aria-pressed={Boolean(lead)}
              aria-label={lead ? "Remover da lista" : "Salvar na lista"}
              title={lead ? `Na lista · ${STATUS_LABEL[lead.status]}` : "Salvar na lista"}
              className={cn(
                "grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors",
                lead ? "text-brand hover:bg-brand/10" : "text-mute hover:bg-white/5 hover:text-paper",
              )}
            >
              <BookmarkSimple size={18} weight={lead ? "fill" : "regular"} />
            </button>
          </div>

          <div className="mt-2 flex items-center gap-2 text-[13px]">
            {place.rating != null ? (
              <>
                <span className="font-semibold tabular-nums">{formatRating(place.rating)}</span>
                <Stars value={place.rating} size={13} />
                <span className="text-mute tabular-nums">({formatCount(place.reviewCount)})</span>
              </>
            ) : (
              <span className="text-mute">Sem avaliações</span>
            )}
          </div>

          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {lead && <span className="inline-flex h-6 items-center rounded-md bg-paper px-2 text-[11px] font-semibold text-ink">{STATUS_LABEL[lead.status]}</span>}
            <WhatsAppChip place={place} />
            <WebsiteChip place={place} />
            <OpenChip place={place} />
          </div>

          {(place.whatsapp || place.phone) && (
            <div className="mt-3 flex gap-2">
              <WhatsAppButton place={place} size="sm" />
              <CallButton place={place} size="sm" />
            </div>
          )}
        </div>
      </div>
    </article>
  );
});

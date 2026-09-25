"use client";

import { ArrowRight, Phone, WhatsappLogo, X } from "@phosphor-icons/react";
import Link from "next/link";
import { CompanyPhoto } from "@/components/prospect/bits";
import { useContact } from "@/components/prospect/useContact";
import { buttonClass } from "@/components/ui/button";
import { Stars } from "@/components/ui/Stars";
import { formatDistance } from "@/lib/geo";
import type { ResultPlace } from "@/lib/types";
import { formatCount, formatRating } from "@/lib/utils";

/** Cartão exibido ao clicar num marcador do mapa. */
export function MarkerCard({ place, onClose }: { place: ResultPlace; onClose: () => void }) {
  const contact = useContact(place);
  const waHref = contact.whatsappHref();
  return (
    <div className="animate-slide-up absolute inset-x-3 bottom-3 z-20 mx-auto max-w-md rounded-2xl border border-line-2 bg-ink-2/95 p-4 shadow-2xl backdrop-blur md:bottom-5">
      <div className="flex gap-3">
        <CompanyPhoto place={place} size={52} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate font-semibold">{place.name}</p>
            <button type="button" onClick={onClose} aria-label="Fechar" className="-mr-1 -mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-lg text-mute hover:bg-white/5 hover:text-paper">
              <X size={15} />
            </button>
          </div>
          <p className="truncate text-xs text-mute">
            {place.category ?? "Categoria não encontrada"} · {place.distanceKm != null ? formatDistance(place.distanceKm) : "distância não disponível"}
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-xs">
            {place.rating != null ? (
              <>
                <b className="tabular-nums">{formatRating(place.rating)}</b>
                <Stars value={place.rating} size={12} />
                <span className="text-mute">({formatCount(place.reviewCount ?? 0)})</span>
              </>
            ) : (
              <span className="text-mute">Avaliações não encontradas</span>
            )}
          </div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {waHref ? (
          <a href={waHref} target="_blank" rel="noopener noreferrer" onClick={contact.onWhatsApp} className={buttonClass("primary", "md")}>
            <WhatsappLogo size={17} weight="fill" /> WhatsApp
          </a>
        ) : (
          <span className={buttonClass("outline", "md", "pointer-events-none opacity-40")}>Sem WhatsApp</span>
        )}
        {contact.telHref ? (
          <a href={contact.telHref} onClick={contact.onCall} className={buttonClass("light", "md")}>
            <Phone size={16} weight="fill" /> Ligar
          </a>
        ) : (
          <span className={buttonClass("outline", "md", "pointer-events-none opacity-40")}>Sem telefone</span>
        )}
        <Link href={`/app/empresa/${encodeURIComponent(place.id)}`} className={buttonClass("outline", "md")}>
          Ver <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}

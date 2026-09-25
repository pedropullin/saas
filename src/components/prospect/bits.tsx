"use client";

import { Storefront } from "@phosphor-icons/react";
import { Chip } from "@/components/ui/misc";
import { hasFact, instagramHandle, type ContactFacts } from "@/lib/contact";
import { STATUS_LABEL, type LeadStatus } from "@/lib/leads";
import type { Place } from "@/lib/types";
import { cn, hostname } from "@/lib/utils";
import { CONFIDENCE_HINT } from "@/lib/whatsapp";

export function photoUrl(name: string, width = 400) {
  return `/api/places/photo?name=${encodeURIComponent(name)}&w=${width}`;
}

export function CompanyPhoto({ place, size = 56, className }: { place: Place; size?: number; className?: string }) {
  const photo = place.photos[0];
  if (photo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl(photo.name, size * 3)}
        alt={`Foto de ${place.name}`}
        title={photo.attributions[0] ? `Foto: ${photo.attributions[0].name}` : undefined}
        loading="lazy"
        width={size}
        height={size}
        className={cn("shrink-0 rounded-xl border border-line bg-ink-4 object-cover", className)}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className={cn("grid shrink-0 place-items-center rounded-xl border border-line bg-gradient-to-br from-ink-4 to-ink-2 text-mute", className)}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <Storefront size={size * 0.42} />
    </span>
  );
}

export function WhatsAppChip({ facts }: { facts: ContactFacts }) {
  if (!hasFact(facts.whatsapp)) return <Chip tone="dim">WhatsApp: não encontrado</Chip>;
  const { confidence } = facts.whatsapp.value;
  const hint = CONFIDENCE_HINT[confidence];
  if (confidence === "confirmado") return <Chip tone="solid" title={hint}>WhatsApp confirmado</Chip>;
  if (confidence === "provavel") return <Chip tone="red" title={hint}>WhatsApp provável</Chip>;
  return <Chip tone="dim" title={hint}>Fixo · WhatsApp incerto</Chip>;
}

export function SiteChip({ facts }: { facts: ContactFacts }) {
  return hasFact(facts.website) ? <Chip>Possui site</Chip> : <Chip tone="red">Sem site</Chip>;
}

export function LeadChip({ status }: { status: LeadStatus | null }) {
  if (!status) return null;
  return <Chip tone={status === "cliente" ? "solid" : "light"}>Lead · {STATUS_LABEL[status]}</Chip>;
}

export function OpenNowChip({ place }: { place: Place }) {
  if (place.status === "CLOSED_PERMANENTLY") return <Chip tone="dim">Fechada permanentemente</Chip>;
  if (place.status === "CLOSED_TEMPORARILY") return <Chip tone="dim">Fechada temporariamente</Chip>;
  if (place.openNow === true) return <Chip>Aberto agora</Chip>;
  if (place.openNow === false) return <Chip tone="dim">Fechado agora</Chip>;
  return null;
}

/** Horário de hoje a partir da lista de segunda a domingo. */
export function todayHours(place: Place): string | null {
  if (!place.hours.length) return null;
  const line = place.hours[(new Date().getDay() + 6) % 7];
  return line ? line.replace(/^[^:]+:\s*/, "") : null;
}

export function factText(fact: ContactFacts[keyof ContactFacts], kind: "site" | "instagram" | "email" | "facebook" | "phone"): string {
  if (fact.state === "unknown") return "Verificando…";
  if (fact.state !== "found") return "Não encontrado";
  const value = fact.value as string;
  if (kind === "site" || kind === "facebook") return hostname(value);
  if (kind === "instagram") return instagramHandle(value);
  return value;
}

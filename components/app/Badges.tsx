import type { Place } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CONFIDENCE_HINT } from "@/lib/whatsapp";

export function Chip({ children, tone = "default", title }: { children: React.ReactNode; tone?: "default" | "red" | "solid" | "dim"; title?: string }) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex h-6 items-center gap-1 rounded-md px-2 text-[11px] font-medium whitespace-nowrap",
        tone === "default" && "border border-line-2 text-mute-2",
        tone === "red" && "border border-brand/50 text-brand",
        tone === "solid" && "bg-brand text-white",
        tone === "dim" && "bg-white/[0.05] text-mute",
      )}
    >
      {children}
    </span>
  );
}

export function WhatsAppChip({ place }: { place: Place }) {
  if (!place.whatsapp) return <Chip tone="dim">Sem telefone</Chip>;
  const hint = CONFIDENCE_HINT[place.whatsapp.confidence];
  if (place.whatsapp.confidence === "confirmado") return <Chip tone="solid" title={hint}>WhatsApp confirmado</Chip>;
  if (place.whatsapp.confidence === "provavel") return <Chip tone="red" title={hint}>Celular · provável WhatsApp</Chip>;
  return <Chip tone="dim" title={hint}>Telefone fixo</Chip>;
}

export function WebsiteChip({ place }: { place: Place }) {
  if (place.website) return null;
  return (
    <Chip tone="default" title="Não há site cadastrado no Google. Boa oportunidade para oferecer presença digital.">
      {place.social ? "Só rede social" : "Sem site"}
    </Chip>
  );
}

export function OpenChip({ place }: { place: Place }) {
  if (place.status === "CLOSED_PERMANENTLY") return <Chip tone="dim">Fechado permanentemente</Chip>;
  if (place.status === "CLOSED_TEMPORARILY") return <Chip tone="dim">Fechado temporariamente</Chip>;
  if (place.openNow === true) return <Chip tone="default">Aberto agora</Chip>;
  if (place.openNow === false) return <Chip tone="dim">Fechado agora</Chip>;
  return null;
}

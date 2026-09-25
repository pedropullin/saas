"use client";

import { Phone, WhatsappLogo } from "@phosphor-icons/react";
import { buttonClass } from "@/components/ui/button";
import { registerContact } from "@/lib/leads";
import { activeTemplate, useSettings } from "@/lib/settings";
import { toast } from "@/lib/toast";
import type { Place } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CONFIDENCE_HINT, fillTemplate, whatsappUrl } from "@/lib/whatsapp";
import { useMyName } from "./AppSession";

type Size = "sm" | "md" | "lg" | "icon";

function useContactClick(place: Place, kind: "whatsapp" | "ligacao") {
  const myName = useMyName();
  return (event: React.MouseEvent) => {
    event.stopPropagation();
    if (place.demo) {
      event.preventDefault();
      toast("Modo demonstração: contato bloqueado para empresas fictícias.");
      return;
    }
    registerContact(place, myName || null);
    toast(
      kind === "whatsapp"
        ? `Abrindo o WhatsApp de ${place.name}. Marcado como contatado.`
        : `Ligando para ${place.name}. Marcado como contatado.`,
    );
  };
}

export function WhatsAppButton({
  place,
  message,
  size = "md",
  label = "WhatsApp",
  className,
}: {
  place: Place;
  message?: string;
  size?: Size;
  label?: string | null;
  className?: string;
}) {
  const settings = useSettings();
  const myName = useMyName();
  const onClick = useContactClick(place, "whatsapp");
  if (!place.whatsapp) return null;

  const text = message ?? fillTemplate(activeTemplate(settings).body, place, myName);
  const href = whatsappUrl(place.whatsapp, text);
  if (!href) return null;
  const uncertain = place.whatsapp.confidence === "possivel";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      title={CONFIDENCE_HINT[place.whatsapp.confidence]}
      aria-label={`Chamar ${place.name} no WhatsApp`}
      className={buttonClass(uncertain ? "danger-outline" : "primary", size, className)}
    >
      <WhatsappLogo size={size === "lg" ? 20 : 17} weight="fill" />
      {label && size !== "icon" && <span>{uncertain ? `Tentar ${label}` : label}</span>}
    </a>
  );
}

export function CallButton({
  place,
  size = "md",
  label = "Ligar",
  className,
}: {
  place: Place;
  size?: Size;
  label?: string | null;
  className?: string;
}) {
  const onClick = useContactClick(place, "ligacao");
  if (!place.phone) return null;
  return (
    <a
      href={`tel:${place.phone.e164}`}
      onClick={onClick}
      title={place.phone.international}
      aria-label={`Ligar para ${place.name}`}
      className={buttonClass("light", size, cn(className))}
    >
      <Phone size={size === "lg" ? 19 : 16} weight="fill" />
      {label && size !== "icon" && <span>{label}</span>}
    </a>
  );
}

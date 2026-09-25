"use client";

import { useApp } from "@/components/shell/AppContext";
import { trackContact, saveLeads } from "@/client/company-actions";
import { toast } from "@/client/toast";
import { contactFacts, hasFact } from "@/lib/contact";
import type { Place, ResultPlace, WhatsAppInfo } from "@/lib/types";
import { fillTemplate, whatsappUrl } from "@/lib/whatsapp";

/** Links e cliques de contato de uma empresa (WhatsApp com mensagem pronta e ligação). */
export function useContact(place: Place | ResultPlace) {
  const { prefs, user } = useApp();
  const enrichment = "enrichment" in place ? place.enrichment : null;
  const facts = contactFacts(place, enrichment);
  const whatsapp: WhatsAppInfo | null = hasFact(facts.whatsapp) ? facts.whatsapp.value : null;
  const template = prefs.templates.find((t) => t.id === prefs.activeTemplateId) ?? prefs.templates[0]!;
  const message = fillTemplate(template.body, place, user.name.split(" ")[0] ?? user.name);
  const isLead = "saved" in place && Boolean(place.saved.leadId);

  function guard(event: React.MouseEvent): boolean {
    event.stopPropagation();
    if (place.demo) {
      event.preventDefault();
      toast("Modo demonstração: contato bloqueado para empresas fictícias.");
      return false;
    }
    return true;
  }

  function afterContact(channel: "whatsapp" | "ligacao") {
    if (isLead) {
      void trackContact(place, channel);
      return;
    }
    toast(channel === "whatsapp" ? `Conversando com ${place.name}?` : `Ligando para ${place.name}…`, {
      action: { label: "Adicionar aos leads", onClick: () => void saveLeads([place]).then(() => trackContact(place, channel)) },
    });
  }

  return {
    facts,
    whatsapp,
    message,
    whatsappHref: (text = message) => (whatsapp ? whatsappUrl(whatsapp, text) : null),
    telHref: place.phone ? `tel:${place.phone.e164}` : null,
    onWhatsApp(event: React.MouseEvent) {
      if (guard(event)) afterContact("whatsapp");
    },
    onCall(event: React.MouseEvent) {
      if (guard(event)) afterContact("ligacao");
    },
  };
}

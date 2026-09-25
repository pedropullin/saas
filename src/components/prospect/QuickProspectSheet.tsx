"use client";

import { ArrowUpRight, Copy, Globe, InstagramLogo, Kanban, NotePencil, Phone, SpinnerGap, WhatsappLogo } from "@phosphor-icons/react";
import { useState } from "react";
import { saveLeads } from "@/client/company-actions";
import { toast } from "@/client/toast";
import { useApp } from "@/components/shell/AppContext";
import { buttonClass } from "@/components/ui/button";
import { Textarea } from "@/components/ui/form";
import { Sheet } from "@/components/ui/Modal";
import { hasFact } from "@/lib/contact";
import type { Place, ResultPlace } from "@/lib/types";
import { cn, formatRating } from "@/lib/utils";
import { CONFIDENCE_HINT, fillTemplate } from "@/lib/whatsapp";
import { addNoteAction } from "@/server/leads/actions";
import { factText } from "./bits";
import { useContact } from "./useContact";

function copy(text: string, label: string) {
  navigator.clipboard
    .writeText(text)
    .then(() => toast.success(`${label} copiado.`))
    .catch(() => toast.error("Não foi possível copiar."));
}

export function QuickProspectSheet({
  place,
  leadId: initialLeadId,
  open,
  onClose,
}: {
  place: Place | ResultPlace;
  leadId?: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const { prefs, user } = useApp();
  const contact = useContact(place);
  const [templateId, setTemplateId] = useState(prefs.activeTemplateId);
  const template = prefs.templates.find((t) => t.id === templateId) ?? prefs.templates[0]!;
  const firstName = user.name.split(" ")[0] ?? user.name;
  const [message, setMessage] = useState(() => fillTemplate(template.body, place, firstName));
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState<"lead" | "note" | null>(null);
  const [leadId, setLeadId] = useState<string | null>(initialLeadId ?? ("saved" in place ? place.saved.leadId : null));
  const { facts } = contact;
  const waHref = contact.whatsappHref(message);

  const info = [
    place.name,
    place.category,
    place.address,
    `Telefone: ${factText(facts.phone, "phone")}`,
    `WhatsApp: ${hasFact(facts.whatsapp) && facts.whatsapp.value.number ? `+${facts.whatsapp.value.number}` : "Não encontrado"}`,
    `Site: ${hasFact(facts.website) ? facts.website.value : "Não encontrado"}`,
    `Instagram: ${hasFact(facts.instagram) ? facts.instagram.value : "Não encontrado"}`,
    `E-mail: ${hasFact(facts.email) ? facts.email.value : "Não encontrado"}`,
    `Avaliação: ${place.rating != null ? `${formatRating(place.rating)} (${place.reviewCount ?? 0} avaliações)` : "Não encontrado"}`,
    place.mapsUrl ? `Google Maps: ${place.mapsUrl}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  async function ensureLead(): Promise<string | null> {
    if (leadId) return leadId;
    const result = await saveLeads([place]);
    const id = result?.leadIds[place.id] ?? null;
    setLeadId(id);
    return id;
  }

  return (
    <Sheet open={open} onClose={onClose} title="Prospectar" description={place.name}>
      <div className="space-y-6 p-5">
        <section>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {prefs.templates.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTemplateId(t.id);
                  setMessage(fillTemplate(t.body, place, firstName));
                }}
                className={cn("h-7 rounded-md px-2.5 text-xs font-medium", t.id === template.id ? "bg-paper text-ink" : "border border-line-2 text-mute-2 hover:text-paper")}
              >
                {t.name}
              </button>
            ))}
          </div>
          <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} aria-label="Mensagem para o WhatsApp" />
          {waHref ? (
            <a href={waHref} target="_blank" rel="noopener noreferrer" onClick={contact.onWhatsApp} className={buttonClass("primary", "xl", "mt-3 w-full")}>
              <WhatsappLogo size={22} weight="fill" /> Enviar no WhatsApp
            </a>
          ) : (
            <p className="mt-3 rounded-xl border border-line px-3 py-2.5 text-sm text-mute">WhatsApp não encontrado para esta empresa.</p>
          )}
          {contact.whatsapp && <p className="mt-2 text-xs text-mute">{CONFIDENCE_HINT[contact.whatsapp.confidence]}</p>}
        </section>

        <section className="grid grid-cols-2 gap-2">
          {contact.telHref ? (
            <a href={contact.telHref} onClick={contact.onCall} className={buttonClass("light", "lg", "col-span-2")}>
              <Phone size={18} weight="fill" /> Ligar · {place.phone?.national}
            </a>
          ) : (
            <span className={buttonClass("outline", "lg", "col-span-2 pointer-events-none opacity-50")}>Telefone não encontrado</span>
          )}
          <a
            href={hasFact(facts.instagram) ? facts.instagram.value : undefined}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!hasFact(facts.instagram)}
            className={buttonClass("outline", "md", !hasFact(facts.instagram) && "pointer-events-none opacity-40")}
          >
            <InstagramLogo size={17} /> Abrir Instagram
          </a>
          <a
            href={hasFact(facts.website) ? facts.website.value : undefined}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!hasFact(facts.website)}
            className={buttonClass("outline", "md", !hasFact(facts.website) && "pointer-events-none opacity-40")}
          >
            <Globe size={17} /> Abrir website
          </a>
          <button type="button" disabled={!place.phone} onClick={() => place.phone && copy(place.phone.international, "Telefone")} className={buttonClass("outline", "md")}>
            <Copy size={16} /> Copiar telefone
          </button>
          <button type="button" onClick={() => copy(info, "Informações")} className={buttonClass("outline", "md")}>
            <Copy size={16} /> Copiar informações
          </button>
          {leadId ? (
            <a href={`/app/leads?lead=${leadId}`} className={buttonClass("subtle", "md", "col-span-2")}>
              <Kanban size={17} /> Ver no funil de leads <ArrowUpRight size={14} />
            </a>
          ) : (
            <button
              type="button"
              disabled={saving !== null}
              onClick={async () => {
                setSaving("lead");
                await ensureLead();
                setSaving(null);
              }}
              className={buttonClass("subtle", "md", "col-span-2")}
            >
              {saving === "lead" ? <SpinnerGap size={16} className="animate-spin" /> : <Kanban size={17} />} Adicionar aos leads
            </button>
          )}
        </section>

        <section>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <NotePencil size={16} className="text-brand" /> Observações da conversa
          </h3>
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} placeholder="Com quem falou, interesse, objeções, próximo passo…" />
          <button
            type="button"
            disabled={!note.trim() || saving !== null}
            onClick={async () => {
              setSaving("note");
              const id = await ensureLead();
              if (id) {
                const result = await addNoteAction(id, note);
                if (result.ok) {
                  setNote("");
                  toast.success("Observação salva no lead.");
                } else toast.error(result.error);
              }
              setSaving(null);
            }}
            className={buttonClass("primary", "md", "mt-2 w-full")}
          >
            {saving === "note" ? <SpinnerGap size={16} className="animate-spin" /> : null} Salvar observação
          </button>
          {!leadId && <p className="mt-2 text-xs text-mute">Ao salvar, a empresa entra nos seus leads.</p>}
        </section>
      </div>
    </Sheet>
  );
}

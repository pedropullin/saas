"use client";

import {
  ArrowUpRight,
  BookmarkSimple,
  Clock,
  Copy,
  Globe,
  GoogleLogo,
  InstagramLogo,
  MapPin,
  Phone,
  Trash,
  WhatsappLogo,
  X,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { buttonClass } from "@/components/ui/button";
import { Stars } from "@/components/ui/Stars";
import { demoDetails } from "@/lib/demo-details";
import { LEAD_STATUSES, removeLead, saveLead, updateLead, type Lead } from "@/lib/leads";
import { useSettings } from "@/lib/settings";
import { toast } from "@/lib/toast";
import type { Place, PlaceDetails } from "@/lib/types";
import { cn, formatCount, formatRating, hostname } from "@/lib/utils";
import { CONFIDENCE_HINT, CONFIDENCE_LABEL, fillTemplate } from "@/lib/whatsapp";
import { useMyName } from "./AppSession";
import { OpenChip, WebsiteChip, WhatsAppChip } from "./Badges";
import { CallButton, WhatsAppButton } from "./ContactButtons";

const detailsCache = new Map<string, PlaceDetails>();

function usePlaceDetails(place: Place) {
  const [result, setResult] = useState<{ id: string; details: PlaceDetails | null; error: string | null }>({
    id: "",
    details: null,
    error: null,
  });

  useEffect(() => {
    if (place.demo || detailsCache.has(place.id)) return;
    const controller = new AbortController();
    fetch(`/api/places/${encodeURIComponent(place.id)}`, { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data?.error ?? "Não foi possível carregar os detalhes.");
        detailsCache.set(place.id, data as PlaceDetails);
        setResult({ id: place.id, details: data as PlaceDetails, error: null });
      })
      .catch((error: Error) => {
        if (error.name !== "AbortError") setResult({ id: place.id, details: null, error: error.message });
      });
    return () => controller.abort();
  }, [place.id, place.demo]);

  if (place.demo) return { details: demoDetails(place), loading: false, error: null };
  const cached = detailsCache.get(place.id);
  if (cached) return { details: cached, loading: false, error: null };
  if (result.id === place.id) return { details: result.details, loading: false, error: result.error };
  return { details: null, loading: true, error: null };
}

function MessageComposer({ place, initial }: { place: Place; initial: string }) {
  const [text, setText] = useState(initial);
  return (
    <div className="space-y-3">
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={5}
        aria-label="Mensagem para o WhatsApp"
        className="w-full resize-y rounded-xl border border-line-2 bg-ink p-3 text-sm leading-relaxed outline-none focus:border-brand"
      />
      <div className="flex flex-wrap gap-2">
        <WhatsAppButton place={place} message={text} label="Enviar no WhatsApp" className="flex-1" />
        <button
          type="button"
          onClick={() => {
            navigator.clipboard
              .writeText(text)
              .then(() => toast("Mensagem copiada."))
              .catch(() => toast("Não foi possível copiar.", "error"));
          }}
          className={buttonClass("outline", "md")}
        >
          <Copy size={16} /> Copiar
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line px-5 py-5 md:px-6">
      <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-mute">{title}</h3>
      {children}
    </section>
  );
}

export function PlaceDetailsPanel({ place, lead, onClose }: { place: Place; lead: Lead | undefined; onClose: () => void }) {
  const { details, loading, error } = usePlaceDetails(place);
  const settings = useSettings();
  const myName = useMyName();
  const [templateId, setTemplateId] = useState(settings.activeTemplateId);
  const template = settings.templates.find((t) => t.id === templateId) ?? settings.templates[0]!;
  const today = (new Date().getDay() + 6) % 7; // Google lista de segunda a domingo

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <aside
      aria-label={`Detalhes de ${place.name}`}
      className="animate-slide-in fixed inset-0 z-40 flex flex-col overflow-y-auto bg-ink-2 md:absolute md:inset-y-0 md:left-auto md:right-0 md:w-[440px] md:border-l md:border-line md:shadow-[-30px_0_60px_-20px_rgba(0,0,0,0.8)]"
    >
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-ink-2/95 px-5 py-3 backdrop-blur md:px-6">
        <span className="truncate text-xs font-medium uppercase tracking-[0.14em] text-mute">
          {place.category ?? "Empresa"}
          {place.demo && <span className="ml-2 rounded bg-brand px-1.5 py-0.5 text-[10px] text-white">DEMO</span>}
        </span>
        <button type="button" onClick={onClose} className={buttonClass("ghost", "icon", "-mr-2")} aria-label="Fechar detalhes">
          <X size={18} />
        </button>
      </div>

      <div className="px-5 pb-5 pt-5 md:px-6">
        <h2 className="text-2xl font-semibold leading-tight tracking-tight">{place.name}</h2>
        {place.address && (
          <p className="mt-2 flex gap-1.5 text-sm text-mute">
            <MapPin size={15} className="mt-0.5 shrink-0" />
            {place.address}
          </p>
        )}

        <div className="mt-5 flex items-end gap-4 rounded-2xl border border-line bg-ink p-4">
          <span className="text-5xl font-semibold leading-none tracking-tighter tabular-nums">{formatRating(place.rating)}</span>
          <div className="pb-0.5">
            <Stars value={place.rating} size={17} />
            <p className="mt-1 text-sm text-mute">
              {place.reviewCount ? `${formatCount(place.reviewCount)} avaliações no Google` : "Ainda sem avaliações"}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          <WhatsAppChip place={place} />
          <WebsiteChip place={place} />
          <OpenChip place={place} />
          {place.priceLevel != null && place.priceLevel > 0 && (
            <span className="inline-flex h-6 items-center rounded-md border border-line-2 px-2 text-[11px] text-mute-2">
              {"$".repeat(place.priceLevel)}
              <span className="text-line-2">{"$".repeat(4 - place.priceLevel)}</span>
            </span>
          )}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <WhatsAppButton place={place} size="lg" className="col-span-2" />
          <CallButton place={place} size="lg" className={place.mapsUrl ? "" : "col-span-2"} />
          {place.mapsUrl && (
            <a href={place.mapsUrl} target="_blank" rel="noopener noreferrer" className={buttonClass("outline", "lg", place.phone ? "" : "col-span-2")}>
              <GoogleLogo size={17} weight="bold" /> Google Maps
            </a>
          )}
        </div>
        {!place.phone && !place.whatsapp && (
          <p className="mt-3 text-sm text-mute">Esta empresa não tem telefone no Google Maps.</p>
        )}
      </div>

      <Section title="Sua lista">
        {lead ? (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-1.5">
              {LEAD_STATUSES.map((status) => (
                <button
                  key={status.id}
                  type="button"
                  onClick={() => updateLead(place.id, { status: status.id })}
                  aria-pressed={lead.status === status.id}
                  className={cn(
                    "h-9 rounded-lg border text-[13px] font-medium transition-colors",
                    lead.status === status.id
                      ? status.id === "fechado"
                        ? "border-brand bg-brand text-white"
                        : "border-paper bg-paper text-ink"
                      : "border-line-2 text-mute-2 hover:border-mute hover:text-paper",
                  )}
                >
                  {status.label}
                </button>
              ))}
            </div>
            <textarea
              value={lead.notes}
              onChange={(event) => updateLead(place.id, { notes: event.target.value })}
              placeholder="Anotações: com quem falou, próximo passo, proposta…"
              rows={3}
              className="w-full resize-y rounded-xl border border-line-2 bg-ink p-3 text-sm outline-none placeholder:text-mute focus:border-brand"
            />
            <div className="flex items-center justify-between text-xs text-mute">
              <span>
                {lead.contactCount
                  ? `${lead.contactCount} contato${lead.contactCount > 1 ? "s" : ""} registrado${lead.contactCount > 1 ? "s" : ""}`
                  : "Nenhum contato registrado"}
              </span>
              <button
                type="button"
                onClick={() => {
                  removeLead(place.id);
                  toast("Removida da lista.");
                }}
                className="inline-flex items-center gap-1 hover:text-brand"
              >
                <Trash size={13} /> Remover
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              saveLead(place, myName || null);
              toast(`${place.name} foi salva na sua lista.`);
            }}
            className={buttonClass("outline", "md", "w-full")}
          >
            <BookmarkSimple size={16} /> Salvar na lista de prospecção
          </button>
        )}
      </Section>

      {place.whatsapp && (
        <Section title="Mensagem">
          <div className="mb-3 flex flex-wrap gap-1.5">
            {settings.templates.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTemplateId(t.id)}
                className={cn(
                  "h-7 rounded-md px-2.5 text-xs font-medium",
                  t.id === template.id ? "bg-paper text-ink" : "border border-line-2 text-mute-2 hover:text-paper",
                )}
              >
                {t.name}
              </button>
            ))}
          </div>
          <MessageComposer
            key={`${place.id}:${template.id}:${template.body}:${myName}`}
            place={place}
            initial={fillTemplate(template.body, place, myName)}
          />
          <p className="mt-3 flex gap-1.5 text-xs text-mute">
            <WhatsappLogo size={14} className="mt-px shrink-0" />
            {CONFIDENCE_LABEL[place.whatsapp.confidence]}. {CONFIDENCE_HINT[place.whatsapp.confidence]}
          </p>
        </Section>
      )}

      <Section title="Contato">
        <ul className="space-y-2.5 text-sm">
          {place.phone && (
            <li className="flex items-center gap-2.5">
              <Phone size={16} className="shrink-0 text-mute" />
              <span className="tabular-nums">{place.phone.international}</span>
            </li>
          )}
          {place.website && (
            <li className="flex items-center gap-2.5">
              <Globe size={16} className="shrink-0 text-mute" />
              <a href={place.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 truncate hover:text-brand">
                {hostname(place.website)} <ArrowUpRight size={12} />
              </a>
            </li>
          )}
          {place.social && (
            <li className="flex items-center gap-2.5">
              <InstagramLogo size={16} className="shrink-0 text-mute" />
              <a href={place.social} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 truncate hover:text-brand">
                {hostname(place.social)} <ArrowUpRight size={12} />
              </a>
            </li>
          )}
          {!place.website && (
            <li className="rounded-lg border border-brand/30 bg-brand/[0.06] px-3 py-2 text-[13px] text-mute-2">
              Sem site no Google. Bom argumento se você vende site, tráfego ou marketing.
            </li>
          )}
        </ul>
      </Section>

      {details?.summary && (
        <Section title="Sobre">
          <p className="text-sm leading-relaxed text-mute-2">{details.summary}</p>
        </Section>
      )}

      <Section title="Horário">
        {loading && <p className="text-sm text-mute">Carregando…</p>}
        {error && <p className="text-sm text-brand">{error}</p>}
        {details && details.hours.length === 0 && <p className="text-sm text-mute">Horário não informado.</p>}
        {details && details.hours.length > 0 && (
          <ul className="space-y-1 text-sm">
            {details.hours.map((line, i) => (
              <li key={line} className={cn("flex gap-2", i === today ? "font-medium text-paper" : "text-mute-2")}>
                {i === today && <Clock size={15} className="mt-0.5 text-brand" />}
                <span className={i === today ? "" : "pl-[23px]"}>{line}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Avaliações recentes">
        {loading && <p className="text-sm text-mute">Carregando avaliações…</p>}
        {details && details.reviews.length === 0 && <p className="text-sm text-mute">Nenhuma avaliação com texto.</p>}
        {details && details.reviews.length > 0 && (
          <ul className="space-y-4">
            {details.reviews.map((review, i) => (
              <li key={`${review.author}-${i}`} className="rounded-xl border border-line bg-ink p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate text-sm font-medium">{review.author}</span>
                  <span className="shrink-0 text-xs text-mute">{review.when}</span>
                </div>
                <Stars value={review.rating} size={12} className="mt-1.5" />
                {review.text && <p className="mt-2 text-sm leading-relaxed text-mute-2">{review.text}</p>}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <p className="border-t border-line px-5 py-4 text-[11px] text-mute md:px-6">
        {place.demo ? "Empresa fictícia do modo demonstração." : "Dados e avaliações: Google Maps."}
      </p>
    </aside>
  );
}

"use client";

import {
  ArrowLeft,
  ArrowUpRight,
  BookmarkSimple,
  CheckCircle,
  Clock,
  Envelope,
  FacebookLogo,
  Globe,
  GoogleLogo,
  InstagramLogo,
  Kanban,
  Lightning,
  LinkedinLogo,
  MapPin,
  Phone,
  SpinnerGap,
  WhatsappLogo,
  XCircle,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { saveLeads, toggleFavorite } from "@/client/company-actions";
import { MapView } from "@/components/maps/MapView";
import { AddToListMenu } from "@/components/prospect/AddToListMenu";
import { LeadChip, OpenNowChip, photoUrl } from "@/components/prospect/bits";
import { QuickProspectSheet } from "@/components/prospect/QuickProspectSheet";
import { useContact } from "@/components/prospect/useContact";
import { useApp } from "@/components/shell/AppContext";
import { buttonClass } from "@/components/ui/button";
import { Card, Chip, DemoBadge, Skeleton } from "@/components/ui/misc";
import { Stars } from "@/components/ui/Stars";
import { hasFact, instagramHandle, type Found } from "@/lib/contact";
import { analyzeOpportunity } from "@/lib/opportunity";
import type { Enrichment, PlaceDetails, ResultPlace, SavedState } from "@/lib/types";
import { cn, formatCount, formatRating, hostname } from "@/lib/utils";

const NOT_FOUND = "Não encontrado";

function Row({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href?: string | null }) {
  const missing = value === NOT_FOUND || value === "Verificando…";
  return (
    <div className="flex items-start gap-3 py-2.5">
      <span className="mt-0.5 text-mute">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] uppercase tracking-wider text-mute">{label}</p>
        {href && !missing ? (
          <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-full items-center gap-1 truncate text-sm hover:text-brand">
            <span className="truncate">{value}</span> <ArrowUpRight size={12} className="shrink-0" />
          </a>
        ) : (
          <p className={cn("truncate text-sm", missing && "text-mute")}>{value}</p>
        )}
      </div>
    </div>
  );
}

function YesNo({ label, fact }: { label: string; fact: Found<unknown> | boolean }) {
  const state = typeof fact === "boolean" ? (fact ? "found" : "missing") : fact.state;
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line py-2.5 last:border-0">
      <span className="text-sm text-mute-2">{label}</span>
      {state === "found" ? (
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-paper">
          <CheckCircle size={17} weight="fill" className="text-brand" /> Sim
        </span>
      ) : state === "unknown" ? (
        <span className="inline-flex items-center gap-1.5 text-sm text-mute">
          <SpinnerGap size={15} className="animate-spin" /> Verificando
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 text-sm text-mute">
          <XCircle size={17} /> Não
        </span>
      )}
    </div>
  );
}

export function CompanyView({ details, saved: initialSaved, enrichment: initialEnrichment }: { details: PlaceDetails; saved: SavedState; enrichment: Enrichment | null }) {
  const { prefs } = useApp();
  const [saved, setSaved] = useState(initialSaved);
  const [enrichment, setEnrichment] = useState(initialEnrichment);
  const [prospectOpen, setProspectOpen] = useState(false);
  const [busy, setBusy] = useState<"lead" | "fav" | null>(null);
  const { reviews, summary, ...placeData } = details;
  const place: ResultPlace = useMemo(() => ({ ...placeData, distanceKm: null, saved, enrichment }), [placeData, saved, enrichment]);
  const contact = useContact(place);
  const { facts } = contact;
  const opportunity = analyzeOpportunity(place, enrichment, prefs.service);
  const today = (new Date().getDay() + 6) % 7;
  const waHref = contact.whatsappHref();
  const reference = prefs.location ? { lat: prefs.location.lat, lng: prefs.location.lng } : null;

  // Lê o site da empresa (e-mail e redes) se ainda não foi lido.
  useEffect(() => {
    if (initialEnrichment || !details.website) return;
    let cancelled = false;
    const { reviews: _r, summary: _s, ...payload } = details;
    fetch("/api/enrich", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ places: [payload] }) })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data?.results?.[details.id]) setEnrichment(data.results[details.id]);
      })
      .catch(() => null);
    return () => {
      cancelled = true;
    };
  }, [details, initialEnrichment]);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-5 md:px-8 md:pt-8">
      <Link href="/app/prospectar" className="inline-flex items-center gap-1.5 text-sm text-mute hover:text-paper">
        <ArrowLeft size={15} /> Voltar para os resultados
      </Link>

      {details.photos.length > 0 && (
        <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
          {details.photos.slice(0, 6).map((photo, i) => (
            <figure key={photo.name} className="relative shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoUrl(photo.name, 800)}
                alt={`Foto ${i + 1} de ${details.name}`}
                loading={i < 2 ? "eager" : "lazy"}
                className={cn("rounded-2xl border border-line bg-ink-3 object-cover", i === 0 ? "h-48 w-72 md:h-56 md:w-96" : "h-48 w-48 md:h-56 md:w-56")}
              />
              {photo.attributions[0] && (
                <figcaption className="absolute bottom-2 left-2 max-w-[90%] truncate rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white/80">
                  {photo.attributions[0].uri ? (
                    <a href={photo.attributions[0].uri} target="_blank" rel="noopener noreferrer">
                      Foto: {photo.attributions[0].name}
                    </a>
                  ) : (
                    `Foto: ${photo.attributions[0].name}`
                  )}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      )}

      <header className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Chip>{details.category ?? "Categoria não encontrada"}</Chip>
            <OpenNowChip place={details} />
            <LeadChip status={saved.leadStatus} />
            {details.demo && <DemoBadge />}
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">{details.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            {details.rating != null ? (
              <span className="inline-flex items-center gap-2">
                <Stars value={details.rating} size={16} />
                <b className="text-base tabular-nums">{formatRating(details.rating)}</b>
                <span className="text-mute">{formatCount(details.reviewCount ?? 0)} avaliações</span>
              </span>
            ) : (
              <span className="text-mute">Avaliações: não encontrado</span>
            )}
            <span className="inline-flex items-center gap-1 text-mute">
              <MapPin size={14} /> {details.address ?? "Endereço não encontrado"}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap lg:justify-end">
          {waHref ? (
            <a href={waHref} target="_blank" rel="noopener noreferrer" onClick={contact.onWhatsApp} className={buttonClass("primary", "xl")}>
              <WhatsappLogo size={20} weight="fill" /> WhatsApp
            </a>
          ) : (
            <span className={buttonClass("outline", "xl", "pointer-events-none opacity-40")}>Sem WhatsApp</span>
          )}
          {contact.telHref ? (
            <a href={contact.telHref} onClick={contact.onCall} className={buttonClass("light", "xl")}>
              <Phone size={19} weight="fill" /> Ligar
            </a>
          ) : (
            <span className={buttonClass("outline", "xl", "pointer-events-none opacity-40")}>Sem telefone</span>
          )}
          <button type="button" onClick={() => setProspectOpen(true)} className={buttonClass("outline", "xl", "col-span-2 sm:col-span-1")}>
            <Lightning size={18} weight="fill" className="text-brand" /> Prospectar
          </button>
        </div>
      </header>

      <div className="mt-4 flex flex-wrap gap-2">
        {hasFact(facts.website) && (
          <a href={facts.website.value} target="_blank" rel="noopener noreferrer" className={buttonClass("outline", "sm")}>
            <Globe size={15} /> Site
          </a>
        )}
        <button
          type="button"
          disabled={busy !== null}
          onClick={async () => {
            setBusy("fav");
            const favorite = await toggleFavorite(place);
            if (favorite !== null) setSaved((s) => ({ ...s, favorite }));
            setBusy(null);
          }}
          className={buttonClass(saved.favorite ? "subtle" : "outline", "sm")}
        >
          {busy === "fav" ? <SpinnerGap size={14} className="animate-spin" /> : <BookmarkSimple size={15} weight={saved.favorite ? "fill" : "regular"} className={saved.favorite ? "text-brand" : ""} />}
          {saved.favorite ? "Salva" : "Salvar"}
        </button>
        <AddToListMenu places={[place]} label="Adicionar à lista" align="start" />
        {saved.leadId ? (
          <Link href={`/app/leads?lead=${saved.leadId}`} className={buttonClass("subtle", "sm")}>
            <Kanban size={15} /> Ver lead
          </Link>
        ) : (
          <button
            type="button"
            disabled={busy !== null}
            onClick={async () => {
              setBusy("lead");
              const result = await saveLeads([place]);
              const leadId = result?.leadIds[place.id];
              if (leadId) setSaved((s) => ({ ...s, leadId, leadStatus: "novo" }));
              setBusy(null);
            }}
            className={buttonClass("outline", "sm")}
          >
            {busy === "lead" ? <SpinnerGap size={14} className="animate-spin" /> : <Kanban size={15} />} Adicionar aos leads
          </button>
        )}
        {details.mapsUrl && (
          <a href={details.mapsUrl} target="_blank" rel="noopener noreferrer" className={buttonClass("ghost", "sm")}>
            <GoogleLogo size={15} weight="bold" /> Abrir no Google Maps
          </a>
        )}
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-5">
          <Card className={cn("p-6", opportunity.potential && "border-brand/50 shadow-glow")}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand">Oportunidade</p>
              <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", opportunity.level === "alta" ? "bg-brand text-white" : opportunity.level === "media" ? "bg-paper text-ink" : "bg-white/[0.08] text-mute-2")}>
                Potencial {opportunity.level === "alta" ? "alto" : opportunity.level === "media" ? "médio" : "baixo"}
              </span>
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
              {[
                ["Website", hasFact(facts.website) ? hostname(facts.website.value) : NOT_FOUND],
                ["WhatsApp", hasFact(facts.whatsapp) ? (facts.whatsapp.value.confidence === "possivel" ? "Incerto (fixo)" : "Disponível") : NOT_FOUND],
                ["Instagram", hasFact(facts.instagram) ? "Disponível" : facts.instagram.state === "unknown" ? "Verificando…" : NOT_FOUND],
                ["Avaliação", details.rating != null ? `${formatRating(details.rating)} ★` : NOT_FOUND],
                ["Avaliações", details.reviewCount != null ? formatCount(details.reviewCount) : NOT_FOUND],
                ["E-mail", hasFact(facts.email) ? "Disponível" : facts.email.state === "unknown" ? "Verificando…" : NOT_FOUND],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-[11px] uppercase tracking-wider text-mute">{label}</dt>
                  <dd className={cn("mt-0.5 font-medium", value === NOT_FOUND && "font-normal text-mute")}>{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-5 rounded-xl border border-line bg-ink-2 p-4">
              <p className="text-[11px] uppercase tracking-wider text-mute">Potencial</p>
              <p className="mt-1 font-medium">{opportunity.headline}</p>
              <ul className="mt-2 space-y-1 text-sm text-mute-2">
                {opportunity.reasons.map((reason) => (
                  <li key={reason}>· {reason}</li>
                ))}
              </ul>
            </div>
            <p className="mt-3 text-[11px] text-mute">Análise automática feita só com os dados encontrados.</p>
          </Card>

          <Card className="p-6">
            <h2 className="font-semibold tracking-tight">Informações para prospecção</h2>
            <div className="mt-3">
              <YesNo label="Website encontrado" fact={facts.website} />
              <YesNo label="WhatsApp encontrado" fact={facts.whatsapp} />
              <YesNo label="Telefone encontrado" fact={facts.phone} />
              <YesNo label="Instagram encontrado" fact={facts.instagram} />
              <YesNo label="E-mail encontrado" fact={facts.email} />
              <YesNo label="Potencial lead" fact={opportunity.potential} />
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="font-semibold tracking-tight">Descrição</h2>
            <p className={cn("mt-2 text-sm leading-relaxed", summary ? "text-mute-2" : "text-mute")}>{summary ?? NOT_FOUND}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold tracking-tight">Avaliações</h2>
              {details.rating != null && (
                <span className="flex items-center gap-2 text-sm">
                  <Stars value={details.rating} size={14} /> <b>{formatRating(details.rating)}</b>
                  <span className="text-mute">{formatCount(details.reviewCount ?? 0)} avaliações</span>
                </span>
              )}
            </div>
            {reviews.length === 0 ? (
              <p className="mt-3 text-sm text-mute">Nenhuma avaliação com texto encontrada.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {reviews.map((review, i) => (
                  <li key={`${review.author}-${i}`} className="rounded-xl border border-line bg-ink-2 p-4">
                    <div className="flex items-center justify-between gap-3">
                      {review.authorUri ? (
                        <a href={review.authorUri} target="_blank" rel="noopener noreferrer" className="truncate text-sm font-medium hover:text-brand">
                          {review.author}
                        </a>
                      ) : (
                        <span className="truncate text-sm font-medium">{review.author}</span>
                      )}
                      <span className="shrink-0 text-xs text-mute">{review.when}</span>
                    </div>
                    <Stars value={review.rating} size={12} className="mt-1.5" />
                    {review.text && <p className="mt-2 text-sm leading-relaxed text-mute-2">{review.text}</p>}
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-4 text-[11px] text-mute">{details.demo ? "Avaliações fictícias do modo demonstração." : "Avaliações: Google Maps."}</p>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="p-6">
            <h2 className="font-semibold tracking-tight">Contato e links</h2>
            <div className="mt-2 divide-y divide-line">
              <Row icon={<Phone size={17} />} label="Telefone" value={details.phone?.international ?? NOT_FOUND} href={details.demo ? null : contact.telHref} />
              <Row
                icon={<WhatsappLogo size={17} />}
                label="WhatsApp"
                value={hasFact(facts.whatsapp) ? (facts.whatsapp.value.number ? `+${facts.whatsapp.value.number}` : "Link da empresa") : NOT_FOUND}
                href={details.demo ? null : waHref}
              />
              <Row icon={<Globe size={17} />} label="Website" value={hasFact(facts.website) ? hostname(facts.website.value) : NOT_FOUND} href={hasFact(facts.website) ? facts.website.value : null} />
              <Row
                icon={<InstagramLogo size={17} />}
                label="Instagram"
                value={hasFact(facts.instagram) ? instagramHandle(facts.instagram.value) : facts.instagram.state === "unknown" ? "Verificando…" : NOT_FOUND}
                href={hasFact(facts.instagram) ? facts.instagram.value : null}
              />
              <Row
                icon={<FacebookLogo size={17} />}
                label="Facebook"
                value={hasFact(facts.facebook) ? hostname(facts.facebook.value) + new URL(facts.facebook.value).pathname : facts.facebook.state === "unknown" ? "Verificando…" : NOT_FOUND}
                href={hasFact(facts.facebook) ? facts.facebook.value : null}
              />
              <Row icon={<Envelope size={17} />} label="E-mail" value={hasFact(facts.email) ? facts.email.value : facts.email.state === "unknown" ? "Verificando…" : NOT_FOUND} href={hasFact(facts.email) ? `mailto:${facts.email.value}` : null} />
              {enrichment?.linkedin && <Row icon={<LinkedinLogo size={17} />} label="LinkedIn" value={hostname(enrichment.linkedin) + new URL(enrichment.linkedin).pathname} href={enrichment.linkedin} />}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="flex items-center gap-2 font-semibold tracking-tight">
              <Clock size={17} className="text-brand" /> Horário de funcionamento
            </h2>
            {details.hours.length ? (
              <ul className="mt-3 space-y-1.5 text-sm">
                {details.hours.map((line, i) => (
                  <li key={line} className={cn("flex justify-between gap-3", i === today ? "font-semibold text-paper" : "text-mute-2")}>
                    <span className="capitalize">{line.split(":")[0]}</span>
                    <span className="text-right">{line.slice(line.indexOf(":") + 1).trim()}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-mute">{NOT_FOUND}</p>
            )}
          </Card>

          <Card className="overflow-hidden">
            <div className="relative h-64">
              {details.location ? (
                <MapView items={[{ place, index: 1 }]} selectedId={place.id} reference={reference} circle={null} onSelect={() => undefined} />
              ) : (
                <Skeleton className="h-full w-full rounded-none" />
              )}
            </div>
            <div className="p-5">
              <h2 className="font-semibold tracking-tight">Localização</h2>
              <p className="mt-1 text-sm text-mute-2">{details.address ?? NOT_FOUND}</p>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                {[
                  ["Bairro", details.neighborhood],
                  ["Cidade", details.city],
                  ["Estado", details.state],
                  ["CEP", details.postalCode],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-mute">{label}</dt>
                    <dd className={value ? "" : "text-mute"}>{value ?? NOT_FOUND}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Card>
        </div>
      </div>

      <QuickProspectSheet place={place} leadId={saved.leadId} open={prospectOpen} onClose={() => setProspectOpen(false)} />
    </div>
  );
}

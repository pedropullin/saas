"use client";

import {
  ArrowClockwise,
  BookmarkSimple,
  DownloadSimple,
  Kanban,
  ListBullets,
  Lock,
  MagnifyingGlassMinus,
  MapTrifold,
  SpinnerGap,
  X,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import { saveLeads, toggleFavorite } from "@/client/company-actions";
import { getSearchState, searchActions, useSearch } from "@/client/search-store";
import { toast } from "@/client/toast";
import { MapView } from "@/components/maps/MapView";
import { MarkerCard } from "@/components/maps/MarkerCard";
import { useApp } from "@/components/shell/AppContext";
import { buttonClass } from "@/components/ui/button";
import { Checkbox, Select } from "@/components/ui/form";
import { Sheet } from "@/components/ui/Modal";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/misc";
import { downloadCsv, PLACE_CSV_HEADER, placeCsvRow, toCsv } from "@/lib/csv";
import { applyFilters, type SortKey } from "@/lib/filters";
import { SEARCH_EXAMPLES } from "@/lib/search";
import type { ResultPlace } from "@/lib/types";
import { cn } from "@/lib/utils";
import { authorizeExportAction } from "@/server/billing/actions";
import { AddToListMenu } from "./AddToListMenu";
import { CompanyCard } from "./CompanyCard";
import { FiltersPanel } from "./FiltersPanel";
import { QuickProspectSheet } from "./QuickProspectSheet";
import { SearchBar } from "./SearchBar";

export function Prospector() {
  const s = useSearch();
  const app = useApp();
  const params = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [mobileFilters, setMobileFilters] = useState(false);
  const [selection, setSelection] = useState<Set<string>>(new Set());
  const [prospect, setProspect] = useState<ResultPlace | null>(null);
  const [mapCard, setMapCard] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"lista" | "mapa">("lista");
  const [bulkBusy, setBulkBusy] = useState(false);
  const cardRefs = useRef(new Map<string, HTMLElement>());
  const booted = useRef(false);

  const visible = useMemo(() => applyFilters(s.places, s.filters, s.sort), [s.places, s.filters, s.sort]);
  const items = useMemo(() => visible.map((place, i) => ({ place, index: i + 1 })), [visible]);
  const selected = visible.filter((p) => selection.has(p.id));
  const stats = useMemo(
    () => ({
      whatsapp: visible.filter((p) => p.whatsapp && p.whatsapp.confidence !== "possivel").length,
      noSite: visible.filter((p) => !p.website).length,
    }),
    [visible],
  );
  const mapPlace = mapCard ? visible.find((p) => p.id === mapCard) : undefined;
  const idle = s.status === "idle";

  async function run() {
    const current = getSearchState();
    if (!current.form.q.trim() && !current.form.category) {
      toast.error("Diga o que você procura ou escolha uma categoria.");
      return;
    }
    setSelection(new Set());
    setMapCard(null);
    setMobileFilters(false);
    setFiltersOpen(false);
    const places = await searchActions.run({ location: app.prefs.location, onUsage: app.bumpUsage });
    if (places?.length && app.prefs.autoEnrich) void searchActions.enrich(places);
  }

  async function more() {
    const fresh = await searchActions.loadMore();
    if (fresh?.length && app.prefs.autoEnrich) void searchActions.enrich(fresh);
  }

  const boot = useEffectEvent(() => {
    const q = params.get("q");
    if (params.get("auto") === "1") {
      void run();
    } else if (q && q !== s.form.q) {
      searchActions.setForm({ q });
      void run();
    } else if (idle) setFiltersOpen(true);
  });
  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    boot();
  }, []);

  function selectFromMap(id: string) {
    searchActions.select(id);
    setMapCard(id);
    cardRefs.current.get(id)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  function toggle(id: string, checked: boolean) {
    setSelection((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  async function exportCsv() {
    const target = selected.length ? selected : visible;
    const allowed = await authorizeExportAction(target.length);
    if (!allowed.ok) {
      toast.error(allowed.error);
      return;
    }
    const slug = (s.description ?? "busca").toLowerCase().normalize("NFD").replace(/[^\w]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
    downloadCsv(`prospecta-${slug}.csv`, toCsv([PLACE_CSV_HEADER, ...target.map((p) => placeCsvRow(p, p.enrichment))]));
    toast.success(`${target.length} empresas exportadas.`);
  }

  const allSelected = visible.length > 0 && selected.length === visible.length;

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 border-b border-line bg-ink-2/60 px-4 py-4 md:px-6">
        <SearchBar
          onSubmit={run}
          filtersOpen={filtersOpen || mobileFilters}
          onToggleFilters={() => {
            if (window.matchMedia("(min-width: 768px)").matches) setFiltersOpen((v) => !v);
            else setMobileFilters(true);
          }}
        />
        {filtersOpen && (
          <div className="animate-fade-up mt-4 hidden rounded-2xl border border-line bg-ink-3 p-5 md:block">
            <FiltersPanel />
          </div>
        )}
      </div>

      {idle ? (
        <div className="flex-1 overflow-y-auto px-4 py-8 md:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">Prospectar</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Quem você quer encontrar hoje?</h1>
            <p className="mx-auto mt-3 max-w-xl text-sm text-mute">
              Digite um segmento e um lugar, em qualquer país. Filtros como “sem site” também funcionam no texto.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {SEARCH_EXAMPLES.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => {
                    searchActions.setForm({ q: example });
                    void run();
                  }}
                  className="rounded-full border border-line-2 bg-ink-3 px-4 py-2 text-sm text-mute-2 transition-colors hover:border-brand hover:text-paper"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="relative flex min-h-0 flex-1">
          <section className={cn("flex min-h-0 w-full flex-col border-line lg:w-[580px] lg:border-r xl:w-[640px]", mobileView === "mapa" && "hidden lg:flex")} aria-label="Resultados">
            <div className="shrink-0 border-b border-line px-4 py-3 md:px-5">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={allSelected}
                  onChange={(checked) => setSelection(checked ? new Set(visible.map((p) => p.id)) : new Set())}
                  label={<span className="sr-only">Selecionar todas</span>}
                />
                <p className="min-w-0 flex-1 text-[13px] leading-snug text-mute">
                  <strong className="font-semibold text-paper tabular-nums">{visible.length}</strong> {visible.length === 1 ? "empresa" : "empresas"}
                  {s.places.length !== visible.length && <> de {s.places.length}</>}
                  {visible.length > 0 && (
                    <>
                      {" · "}
                      <span className="text-[#ff4d55]">{stats.whatsapp} com WhatsApp</span> · {stats.noSite} sem site
                    </>
                  )}
                </p>
                <Select value={s.sort} onChange={(e) => searchActions.setSort(e.target.value as SortKey)} aria-label="Ordenar" className="h-8 w-auto rounded-lg text-xs">
                  <option value="relevancia">Relevância</option>
                  <option value="avaliacoes">Mais avaliações</option>
                  <option value="nota">Melhor avaliação</option>
                  <option value="distancia">Distância</option>
                </Select>
                <button type="button" onClick={exportCsv} disabled={!visible.length} className={buttonClass("ghost", "icon-sm")} title="Exportar CSV" aria-label="Exportar CSV">
                  <DownloadSimple size={17} />
                </button>
              </div>
              {s.description && (
                <p className="mt-1.5 truncate pl-8 text-[11px] text-mute">
                  {s.description}
                  {s.regions > 1 && ` · varredura em ${s.regions} regiões`}
                  {s.enriching && (
                    <span className="ml-2 inline-flex items-center gap-1 text-mute-2">
                      <SpinnerGap size={11} className="animate-spin" /> Lendo sites {s.enriching.done}/{s.enriching.total}
                    </span>
                  )}
                </p>
              )}
            </div>

            {selected.length > 0 && (
              <div className="animate-fade-up flex shrink-0 flex-wrap items-center gap-2 border-b border-brand/30 bg-brand/[0.07] px-4 py-2.5 md:px-5">
                <span className="text-sm font-medium">{selected.length} selecionada{selected.length > 1 ? "s" : ""}</span>
                <button
                  type="button"
                  disabled={bulkBusy}
                  onClick={async () => {
                    setBulkBusy(true);
                    await saveLeads(selected);
                    setBulkBusy(false);
                    setSelection(new Set());
                  }}
                  className={buttonClass("primary", "sm")}
                >
                  {bulkBusy ? <SpinnerGap size={14} className="animate-spin" /> : <Kanban size={15} />}
                  Adicionar {selected.length} {selected.length > 1 ? "empresas" : "empresa"} aos leads
                </button>
                <AddToListMenu places={selected} align="start" />
                <button
                  type="button"
                  onClick={async () => {
                    for (const place of selected.filter((p) => !p.saved.favorite)) await toggleFavorite(place);
                  }}
                  className={buttonClass("outline", "sm")}
                >
                  <BookmarkSimple size={15} /> Favoritar
                </button>
                <button type="button" onClick={exportCsv} className={buttonClass("outline", "sm")}>
                  <DownloadSimple size={15} /> Exportar
                </button>
                <button type="button" onClick={() => setSelection(new Set())} className={buttonClass("ghost", "icon-sm", "ml-auto")} aria-label="Limpar seleção">
                  <X size={15} />
                </button>
              </div>
            )}

            <div className="min-h-0 flex-1 overflow-y-auto pb-24 lg:pb-4">
              {s.status === "error" && (
                <div className="p-4 md:p-5">
                  <ErrorState
                    title={s.errorCode === "limite_do_plano" ? "Limite do plano" : "Não foi possível pesquisar"}
                    message={s.error ?? "Erro desconhecido."}
                    action={
                      s.errorCode === "limite_do_plano" ? (
                        <Link href="/app/planos" className={buttonClass("primary", "sm")}>
                          Ver planos
                        </Link>
                      ) : (
                        <button type="button" onClick={run} className={buttonClass("outline", "sm")}>
                          <ArrowClockwise size={15} /> Tentar de novo
                        </button>
                      )
                    }
                  />
                </div>
              )}

              {s.status === "loading" &&
                Array.from({ length: 5 }, (_, i) => (
                  <div key={i} className="flex gap-3 border-b border-line px-5 py-5" aria-hidden="true">
                    <Skeleton className="h-[60px] w-[60px] shrink-0 rounded-xl" />
                    <div className="flex-1 space-y-2.5">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-3 w-1/3" />
                      <div className="flex gap-2 pt-1">
                        <Skeleton className="h-8 w-24 rounded-lg" />
                        <Skeleton className="h-8 w-20 rounded-lg" />
                      </div>
                    </div>
                  </div>
                ))}

              {items.map(({ place, index }) => (
                <CompanyCard
                  key={place.id}
                  ref={(node) => {
                    if (node) cardRefs.current.set(place.id, node);
                    else cardRefs.current.delete(place.id);
                  }}
                  place={place}
                  index={index}
                  active={place.id === s.selectedId}
                  selected={selection.has(place.id)}
                  onSelect={(checked) => toggle(place.id, checked)}
                  onHover={() => searchActions.select(place.id)}
                  onProspect={() => setProspect(place)}
                />
              ))}

              {s.status === "done" && !s.places.length && (
                <div className="p-4 md:p-5">
                  <EmptyState
                    icon={<MagnifyingGlassMinus size={22} />}
                    title="Nenhuma empresa encontrada"
                    description="Tente outro termo, uma região maior, a busca mundial ou remova a restrição de raio."
                  />
                </div>
              )}

              {s.status === "done" && s.places.length > 0 && !visible.length && (
                <div className="p-4 md:p-5">
                  <EmptyState
                    title="Nenhuma empresa passa nos filtros"
                    description="Os resultados existem, mas os filtros atuais escondem todos."
                    action={
                      <button type="button" onClick={() => searchActions.resetFilters()} className={buttonClass("outline", "sm")}>
                        Limpar filtros
                      </button>
                    }
                  />
                </div>
              )}

              {(s.status === "done" || s.status === "more") && s.places.length > 0 && (
                <div className="px-4 py-6 text-center md:px-5">
                  {s.hasMore ? (
                    <button type="button" onClick={more} disabled={s.status === "more"} className={buttonClass("outline", "md", "w-full")}>
                      {s.status === "more" ? <SpinnerGap size={16} className="animate-spin" /> : null}
                      {s.status === "more" ? "Carregando…" : "Carregar mais empresas"}
                    </button>
                  ) : s.moreLockedByPlan ? (
                    <Link href="/app/planos" className={buttonClass("outline", "md", "w-full")}>
                      <Lock size={15} className="text-brand" /> Há mais resultados. O plano Pro mostra até 60 por região.
                    </Link>
                  ) : (
                    <p className="text-xs text-mute">Fim dos resultados. Para cobrir uma área maior, use a varredura ou busque por bairro.</p>
                  )}
                  <p className="mt-3 text-[11px] text-mute">{s.demo ? "Dados fictícios · modo demonstração" : "Resultados do Google Maps"}</p>
                </div>
              )}
            </div>
          </section>

          <section className={cn("relative min-h-0 flex-1", mobileView === "lista" ? "hidden lg:block" : "block")} aria-label="Mapa">
            <MapView
              items={items}
              selectedId={s.selectedId}
              reference={app.prefs.location ? { lat: app.prefs.location.lat, lng: app.prefs.location.lng } : null}
              circle={s.center && s.radiusKm ? { center: s.center, radiusKm: s.radiusKm } : null}
              onSelect={selectFromMap}
            />
            {mapPlace && <MarkerCard place={mapPlace} onClose={() => setMapCard(null)} />}
          </section>

          <button
            type="button"
            onClick={() => setMobileView((v) => (v === "lista" ? "mapa" : "lista"))}
            className="fixed bottom-[calc(76px+env(safe-area-inset-bottom))] left-1/2 z-30 inline-flex h-11 -translate-x-1/2 items-center gap-2 rounded-full bg-paper px-5 text-sm font-semibold text-ink shadow-2xl lg:hidden"
          >
            {mobileView === "lista" ? <MapTrifold size={17} weight="bold" /> : <ListBullets size={17} weight="bold" />}
            {mobileView === "lista" ? "Ver mapa" : `Ver lista (${visible.length})`}
          </button>
        </div>
      )}

      <Sheet
        open={mobileFilters}
        onClose={() => setMobileFilters(false)}
        title="Filtros"
        footer={
          <button type="button" onClick={run} className={buttonClass("primary", "lg", "w-full")}>
            Encontrar empresas
          </button>
        }
      >
        <div className="p-5">
          <FiltersPanel />
        </div>
      </Sheet>

      {prospect && <QuickProspectSheet key={prospect.id} place={prospect} open onClose={() => setProspect(null)} />}
    </div>
  );
}

"use client";

import { BookmarksSimple, DownloadSimple, ListBullets, MapTrifold, SpinnerGap } from "@phosphor-icons/react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import { buttonClass } from "@/components/ui/button";
import { downloadCsv, PLACE_CSV_HEADER, placeCsvRow, toCsv } from "@/lib/csv";
import { applyFilters, DEFAULT_FILTERS, mergePlaces, splitLocations, type SortKey } from "@/lib/filters";
import { saveLeads, useLeads } from "@/lib/leads";
import { toast } from "@/lib/toast";
import type { Place, SearchRequest, SearchResponse } from "@/lib/types";
import { cn, formatRating } from "@/lib/utils";
import { useAppSession, useMyName } from "./AppSession";
import { FilterBar } from "./FilterBar";
import { SchematicMap } from "./maps/SchematicMap";
import { PlaceDetailsPanel } from "./PlaceDetailsPanel";
import { ResultCard } from "./ResultCard";
import { SearchForm, type Near } from "./SearchForm";

const GoogleMapView = dynamic(() => import("./maps/GoogleMapView"), {
  ssr: false,
  loading: () => <div className="map-grid absolute inset-0" />,
});

const EXAMPLES: Array<[string, string]> = [
  ["Dentistas", "Pinheiros, São Paulo"],
  ["Barbearias", "Lisboa, Portugal"],
  ["Academias", "Curitiba; Joinville; Florianópolis"],
  ["Restaurantes japoneses", "Miami, FL"],
  ["Pet shops", "Belo Horizonte"],
  ["Imobiliárias", "Porto Alegre"],
];

interface Cursor {
  request: SearchRequest;
  token: string;
}

class AuthError extends Error {}

type Status = "idle" | "loading" | "more" | "done";

export function Prospector() {
  const params = useSearchParams();
  const router = useRouter();
  const { mapsKey, demo } = useAppSession();
  const leads = useLeads();
  const myName = useMyName();

  const [what, setWhat] = useState(() => params.get("q") ?? "");
  const [where, setWhere] = useState(() => params.get("onde") ?? "");
  const [near, setNear] = useState<Near | null>(null);
  const [radiusKm, setRadiusKm] = useState(5);

  const [places, setPlaces] = useState<Place[]>([]);
  const [cursors, setCursors] = useState<Cursor[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [searchedNear, setSearchedNear] = useState<Near | null>(null);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortKey>("relevancia");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"lista" | "mapa">("lista");

  const searchSeq = useRef(0);
  const booted = useRef(false);
  const cardRefs = useRef(new Map<string, HTMLElement>());
  const listRef = useRef<HTMLDivElement>(null);

  const visible = useMemo(() => applyFilters(places, filters, sort), [places, filters, sort]);
  const items = useMemo(() => visible.map((place, i) => ({ place, index: i + 1 })), [visible]);
  const savedIds = useMemo(() => new Set(Object.keys(leads)), [leads]);
  const openPlace = openId ? (places.find((p) => p.id === openId) ?? leads[openId]?.place ?? null) : null;

  const stats = useMemo(() => {
    const rated = visible.filter((p) => p.rating != null);
    return {
      whatsapp: visible.filter((p) => p.whatsapp && p.whatsapp.confidence !== "possivel").length,
      noSite: visible.filter((p) => !p.website).length,
      avg: rated.length ? rated.reduce((sum, p) => sum + (p.rating ?? 0), 0) / rated.length : null,
    };
  }, [visible]);

  async function callApi(request: SearchRequest): Promise<SearchResponse> {
    const response = await fetch("/api/places/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    const data = await response.json().catch(() => null);
    if (response.status === 401) {
      router.push(`/entrar?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      throw new AuthError(data?.error ?? "Sessão expirada.");
    }
    if (!response.ok) throw new Error(data?.error ?? "Não foi possível buscar agora.");
    return data as SearchResponse;
  }

  async function search(query = what.trim(), rawWhere = where) {
    if (!query) {
      setError("Diga o que você procura. Ex.: dentistas, barbearias, academias.");
      return;
    }
    const seq = ++searchSeq.current;
    const regions = splitLocations(rawWhere);
    const targets = regions.length ? regions : [""];
    if (!regions.length && !near) {
      toast("Dica: diga onde (cidade, bairro ou país) ou use “Perto de mim” para resultados mais precisos.");
    }

    setStatus("loading");
    setError(null);
    setPlaces([]);
    setCursors([]);
    setSelectedId(null);
    setOpenId(null);
    setSearchedNear(near);
    setProgress(targets.length > 1 ? { done: 0, total: targets.length } : null);
    listRef.current?.scrollTo({ top: 0 });

    const urlParams = new URLSearchParams({ q: query });
    if (rawWhere.trim()) urlParams.set("onde", rawWhere.trim());
    router.replace(`/prospectar?${urlParams.toString()}`, { scroll: false });

    let merged: Place[] = [];
    const nextCursors: Cursor[] = [];
    const errors: string[] = [];

    for (const [i, region] of targets.entries()) {
      const request: SearchRequest = { query };
      if (region) request.location = region;
      if (near) request.near = { ...near, radiusKm };
      try {
        const data = await callApi(request);
        if (seq !== searchSeq.current) return;
        merged = mergePlaces(merged, data.places);
        if (data.nextPageToken) nextCursors.push({ request, token: data.nextPageToken });
        setPlaces(merged);
      } catch (err) {
        if (seq !== searchSeq.current || err instanceof AuthError) return;
        errors.push(err instanceof Error ? err.message : "Erro na busca.");
      }
      if (targets.length > 1) setProgress({ done: i + 1, total: targets.length });
    }

    setCursors(nextCursors);
    setStatus("done");
    setProgress(null);
    if (errors.length) setError(errors[0]!);
  }

  async function loadMore() {
    if (!cursors.length || status === "more") return;
    const seq = searchSeq.current;
    setStatus("more");
    let merged = places;
    const next: Cursor[] = [];
    for (const cursor of cursors) {
      try {
        const data = await callApi({ ...cursor.request, pageToken: cursor.token });
        if (seq !== searchSeq.current) return;
        merged = mergePlaces(merged, data.places);
        setPlaces(merged);
        if (data.nextPageToken) next.push({ request: cursor.request, token: data.nextPageToken });
      } catch (err) {
        if (seq !== searchSeq.current || err instanceof AuthError) return;
        setError(err instanceof Error ? err.message : "Erro ao carregar mais.");
      }
    }
    setCursors(next);
    setStatus("done");
  }

  const bootSearch = useEffectEvent(() => {
    if (what.trim()) void search();
  });

  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    bootSearch();
  }, []);

  function selectFromMap(id: string) {
    setSelectedId(id);
    setOpenId(id);
    cardRefs.current.get(id)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  function exportCsv() {
    const slug = `${what}-${where}`.toLowerCase().normalize("NFD").replace(/[^\w]+/g, "-").replace(/^-|-$/g, "");
    downloadCsv(`prospecta-${slug || "busca"}.csv`, toCsv([PLACE_CSV_HEADER, ...visible.map(placeCsvRow)]));
    toast(`${visible.length} empresas exportadas em CSV.`);
  }

  function saveAll() {
    const added = saveLeads(visible, myName || null);
    toast(added ? `${added} empresas adicionadas à sua lista.` : "Todas já estavam na sua lista.");
  }

  const loading = status === "loading";
  const searched = status !== "idle";

  return (
    <main className="relative flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-line bg-ink-2 px-4 py-3 md:px-5">
        <SearchForm
          what={what}
          where={where}
          near={near}
          radiusKm={radiusKm}
          loading={loading}
          onWhat={setWhat}
          onWhere={setWhere}
          onNear={setNear}
          onRadius={setRadiusKm}
          onSubmit={() => void search()}
        />
      </div>

      <div className="relative flex min-h-0 flex-1">
        <section
          className={cn(
            "flex min-h-0 w-full flex-col border-line md:w-[440px] md:border-r lg:w-[500px]",
            mobileView === "mapa" && "hidden md:flex",
          )}
          aria-label="Resultados"
        >
          {searched && (
            <div className="shrink-0 border-b border-line">
              <FilterBar filters={filters} onChange={setFilters} sort={sort} onSort={setSort} />
              <div className="flex items-center justify-between gap-3 px-4 pb-3 text-[13px] md:px-5">
                <p className="min-w-0 truncate text-mute">
                  <strong className="font-semibold text-paper tabular-nums">{visible.length}</strong>
                  {visible.length === 1 ? " empresa" : " empresas"}
                  {places.length !== visible.length && <span> de {places.length}</span>}
                  {visible.length > 0 && (
                    <>
                      {" · "}
                      <span className="text-brand">{stats.whatsapp} com WhatsApp</span>
                      {" · "}
                      {stats.noSite} sem site
                      {stats.avg != null && <> · média {formatRating(stats.avg)}★</>}
                    </>
                  )}
                </p>
                <div className="flex shrink-0 gap-1">
                  <button type="button" onClick={saveAll} disabled={!visible.length} className={buttonClass("ghost", "icon")} title="Salvar todas na lista" aria-label="Salvar todas na lista">
                    <BookmarksSimple size={17} />
                  </button>
                  <button type="button" onClick={exportCsv} disabled={!visible.length} className={buttonClass("ghost", "icon")} title="Exportar CSV" aria-label="Exportar CSV">
                    <DownloadSimple size={17} />
                  </button>
                </div>
              </div>
            </div>
          )}

          <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto pb-24 md:pb-0">
            {progress && (
              <div className="border-b border-line px-5 py-2 text-xs text-mute">
                Buscando região {Math.min(progress.done + 1, progress.total)} de {progress.total}…
                <div className="mt-1.5 h-0.5 overflow-hidden rounded bg-line">
                  <div className="h-full bg-brand transition-all" style={{ width: `${(progress.done / progress.total) * 100}%` }} />
                </div>
              </div>
            )}

            {error && (
              <div className="m-4 rounded-xl border border-brand/50 bg-brand/[0.08] p-4 text-sm text-paper" role="alert">
                {error}
              </div>
            )}

            {!searched && <IdleState onPick={(q, w) => { setWhat(q); setWhere(w); void search(q, w); }} />}

            {loading && !places.length && <LoadingList />}

            {items.map(({ place, index }) => (
              <ResultCard
                key={place.id}
                ref={(node) => {
                  if (node) cardRefs.current.set(place.id, node);
                  else cardRefs.current.delete(place.id);
                }}
                place={place}
                index={index}
                lead={leads[place.id]}
                active={place.id === selectedId || place.id === openId}
                onHover={() => setSelectedId(place.id)}
                onOpen={() => {
                  setSelectedId(place.id);
                  setOpenId(place.id);
                }}
              />
            ))}

            {status === "done" && !places.length && !error && (
              <div className="px-6 py-16 text-center">
                <p className="text-lg font-semibold">Nenhuma empresa encontrada</p>
                <p className="mt-2 text-sm text-mute">Tente outro termo, uma região maior ou tire o “perto de mim”.</p>
              </div>
            )}

            {status === "done" && places.length > 0 && !visible.length && (
              <div className="px-6 py-12 text-center text-sm text-mute">
                Nenhuma empresa passa nos filtros.{" "}
                <button type="button" className="text-brand underline-offset-4 hover:underline" onClick={() => setFilters(DEFAULT_FILTERS)}>
                  Limpar filtros
                </button>
              </div>
            )}

            {searched && places.length > 0 && (
              <div className="space-y-3 px-4 py-6 text-center md:px-5">
                {cursors.length > 0 ? (
                  <button type="button" onClick={() => void loadMore()} disabled={status === "more"} className={buttonClass("outline", "md", "w-full")}>
                    {status === "more" ? <SpinnerGap size={16} className="animate-spin" /> : null}
                    {status === "more" ? "Carregando…" : "Carregar mais empresas"}
                  </button>
                ) : (
                  status === "done" && (
                    <p className="text-xs text-mute">
                      Fim dos resultados. O Google entrega até 60 empresas por busca. Para cobrir uma cidade inteira, busque por
                      bairro e separe com “;”.
                    </p>
                  )
                )}
                <p className="text-[11px] text-mute">{demo ? "Dados fictícios · modo demonstração" : "Resultados do Google Maps"}</p>
              </div>
            )}
          </div>
        </section>

        <section className={cn("relative min-h-0 flex-1", mobileView === "lista" && "hidden md:block")} aria-label="Mapa">
          {mapsKey ? (
            <GoogleMapView apiKey={mapsKey} items={items} selectedId={selectedId} savedIds={savedIds} near={searchedNear} onSelect={selectFromMap} />
          ) : (
            <SchematicMap
              items={items}
              selectedId={selectedId}
              savedIds={savedIds}
              near={searchedNear}
              onSelect={selectFromMap}
              note={
                items.length
                  ? "Mapa esquemático: posições relativas. Configure GOOGLE_MAPS_BROWSER_KEY para ver o Google Maps."
                  : "As empresas encontradas aparecem aqui."
              }
            />
          )}
        </section>

        {openPlace && <PlaceDetailsPanel place={openPlace} lead={leads[openPlace.id]} onClose={() => setOpenId(null)} />}
      </div>

      {searched && !openPlace && (
        <button
          type="button"
          onClick={() => setMobileView((view) => (view === "lista" ? "mapa" : "lista"))}
          className="fixed bottom-5 left-1/2 z-30 inline-flex h-11 -translate-x-1/2 items-center gap-2 rounded-full bg-paper px-5 text-sm font-semibold text-ink shadow-2xl md:hidden"
        >
          {mobileView === "lista" ? <MapTrifold size={17} weight="bold" /> : <ListBullets size={17} weight="bold" />}
          {mobileView === "lista" ? "Ver mapa" : `Ver lista (${visible.length})`}
        </button>
      )}
    </main>
  );
}

function IdleState({ onPick }: { onPick: (what: string, where: string) => void }) {
  return (
    <div className="animate-fade-up px-5 py-8 md:px-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">Comece por aqui</p>
      <h1 className="mt-3 text-3xl font-semibold leading-[1.05] tracking-tight">
        Qual empresa você quer
        <br /> encontrar hoje?
      </h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-mute">
        Digite um segmento e um lugar em qualquer país. Ou toque num exemplo:
      </p>
      <div className="mt-5 flex flex-col gap-2">
        {EXAMPLES.map(([what, where]) => (
          <button
            key={what + where}
            type="button"
            onClick={() => onPick(what, where)}
            className="group flex items-center justify-between rounded-xl border border-line px-4 py-3 text-left text-sm transition-colors hover:border-brand hover:bg-brand/[0.05]"
          >
            <span>
              <span className="font-medium">{what}</span>
              <span className="text-mute"> em {where}</span>
            </span>
            <span className="text-mute transition-transform group-hover:translate-x-0.5 group-hover:text-brand">→</span>
          </button>
        ))}
      </div>
      <ul className="mt-8 space-y-2.5 border-t border-line pt-6 text-[13px] leading-relaxed text-mute">
        <li>
          <strong className="font-medium text-paper">Várias cidades de uma vez:</strong> separe com ponto e vírgula, ex.:
          “Moema; Pinheiros; Tatuapé”.
        </li>
        <li>
          <strong className="font-medium text-paper">Filtro “Sem site”:</strong> acha quem ainda não tem presença digital.
        </li>
        <li>
          <strong className="font-medium text-paper">Chamou, registrou:</strong> quem você chama no WhatsApp entra na sua lista
          como “Contatado”.
        </li>
      </ul>
    </div>
  );
}

function LoadingList() {
  return (
    <div aria-hidden="true">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="flex gap-3.5 border-b border-line px-5 py-5">
          <div className="h-7 w-7 animate-pulse rounded-full bg-ink-4" />
          <div className="flex-1 space-y-2.5">
            <div className="h-4 w-2/3 animate-pulse rounded bg-ink-4" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-ink-3" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-ink-3" />
          </div>
        </div>
      ))}
    </div>
  );
}

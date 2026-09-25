"use client";

import { ArrowRight, Crosshair, ListBullets, MagnifyingGlass, SpinnerGap } from "@phosphor-icons/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { searchActions, useSearch } from "@/client/search-store";
import { toast } from "@/client/toast";
import { useApp } from "@/components/shell/AppContext";
import { buttonClass } from "@/components/ui/button";
import { applyFilters } from "@/lib/filters";
import { MapView } from "./MapView";
import { MarkerCard } from "./MarkerCard";

/** Mapa em tela cheia com busca flutuante e raio ajustável. */
export function FullMap() {
  const s = useSearch();
  const app = useApp();
  const [card, setCard] = useState<string | null>(null);
  const [radius, setRadius] = useState(s.form.radiusKm);
  const visible = useMemo(() => applyFilters(s.places, s.filters, s.sort), [s.places, s.filters, s.sort]);
  const items = useMemo(() => visible.map((place, i) => ({ place, index: i + 1 })), [visible]);
  const place = card ? visible.find((p) => p.id === card) : undefined;
  const loading = s.status === "loading";

  async function run(patch: Partial<typeof s.form> = {}) {
    searchActions.setForm(patch);
    if (!s.form.q.trim() && !s.form.category && !patch.q) return toast.error("Diga o que você procura.");
    setCard(null);
    const places = await searchActions.run({ location: app.prefs.location, onUsage: app.bumpUsage });
    if (places?.length && app.prefs.autoEnrich) void searchActions.enrich(places);
  }

  return (
    <div className="relative h-full min-h-[480px]">
      <MapView
        items={items}
        selectedId={s.selectedId}
        reference={app.prefs.location ? { lat: app.prefs.location.lat, lng: app.prefs.location.lng } : null}
        circle={s.center && s.radiusKm ? { center: s.center, radiusKm: s.radiusKm } : null}
        onSelect={(id) => {
          searchActions.select(id);
          setCard(id);
        }}
      />

      <div className="absolute inset-x-3 top-3 z-20 mx-auto max-w-2xl space-y-2 md:top-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void run();
          }}
          className="flex h-12 items-center gap-2 rounded-2xl border border-line-2 bg-ink-2/95 pl-4 pr-1.5 shadow-2xl backdrop-blur focus-within:border-brand"
        >
          <MagnifyingGlass size={18} className="shrink-0 text-brand" />
          <input
            value={s.form.q}
            onChange={(e) => searchActions.setForm({ q: e.target.value })}
            placeholder="O que você procura? Ex.: academias"
            aria-label="O que você procura?"
            className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-mute"
          />
          <button type="submit" disabled={loading} className={buttonClass("primary", "sm", "h-9")}>
            {loading ? <SpinnerGap size={15} className="animate-spin" /> : "Buscar"}
          </button>
        </form>
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-line-2 bg-ink-2/95 px-4 py-2.5 text-sm shadow-2xl backdrop-blur">
          <Crosshair size={16} className="shrink-0 text-brand" />
          <span className="text-mute-2">Raio</span>
          <input
            type="range"
            min={1}
            max={50}
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            onPointerUp={() => app.prefs.location && s.form.q && void run({ scope: "raio", radiusKm: radius })}
            onKeyUp={(e) => e.key.startsWith("Arrow") && app.prefs.location && s.form.q && void run({ scope: "raio", radiusKm: radius })}
            aria-label="Raio da busca em km"
            className="min-w-[120px] flex-1 accent-[var(--color-brand)]"
          />
          <span className="w-12 text-right tabular-nums">{radius} km</span>
          {!app.prefs.location && <span className="w-full text-[11px] text-mute">Defina sua localização atual no topo para buscar por raio.</span>}
        </div>
      </div>

      <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2 md:bottom-5 md:right-5">
        {s.places.length > 0 && (
          <span className="rounded-full border border-line-2 bg-ink-2/95 px-3 py-1.5 text-xs text-mute-2 backdrop-blur">
            {visible.length} empresas{s.demo ? " · demonstração" : ""}
          </span>
        )}
        <Link href="/app/prospectar" className={buttonClass("light", "sm", "rounded-full")}>
          <ListBullets size={15} /> Ver lista <ArrowRight size={13} />
        </Link>
      </div>

      {place && <MarkerCard place={place} onClose={() => setCard(null)} />}
    </div>
  );
}

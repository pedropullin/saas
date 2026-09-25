"use client";

import { ArrowRight, CaretDown, Crosshair, GlobeHemisphereWest, MagnifyingGlass, MapPin, SlidersHorizontal, SpinnerGap } from "@phosphor-icons/react";
import { searchActions, useSearch } from "@/client/search-store";
import { useApp } from "@/components/shell/AppContext";
import { buttonClass } from "@/components/ui/button";
import { activeFilterCount } from "@/lib/filters";
import { CATEGORIES, countryName } from "@/lib/search";
import { cn } from "@/lib/utils";

export function locationSummary(form: ReturnType<typeof useSearch>["form"], fallback: string | null): string {
  if (form.scope === "mundial") return "Mundial";
  const place = [form.neighborhood, form.city, form.state, form.postalCode, countryName(form.country)].filter(Boolean).join(", ");
  if (form.scope === "raio") return `${form.radiusKm} km de ${place || fallback || "?"}`;
  if (!place && /\s(em|in|en|no|na)\s+\S/i.test(form.q)) return "Local no texto da busca";
  return place || fallback || "Qualquer lugar";
}

export function SearchBar({ onSubmit, filtersOpen, onToggleFilters }: { onSubmit: () => void; filtersOpen: boolean; onToggleFilters: () => void }) {
  const { form, filters, status } = useSearch();
  const { prefs } = useApp();
  const loading = status === "loading";
  const count = activeFilterCount(filters) + (form.category ? 1 : 0) + (form.sweep > 1 ? 1 : 0);
  const category = form.category === "custom" ? form.customCategory || "Personalizada" : CATEGORIES.find((c) => c.id === form.category)?.label;
  const LocIcon = form.scope === "mundial" ? GlobeHemisphereWest : form.scope === "raio" ? Crosshair : MapPin;

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="flex flex-col gap-2 lg:flex-row">
        <label className="group flex h-14 min-w-0 items-center gap-3 rounded-2xl border border-line-2 bg-ink-3 px-4 transition-shadow focus-within:border-brand focus-within:shadow-glow lg:flex-1">
          <MagnifyingGlass size={20} className="shrink-0 text-brand" />
          <span className="sr-only">O que você procura?</span>
          <input
            value={form.q}
            onChange={(e) => searchActions.setForm({ q: e.target.value })}
            placeholder="O que você procura? Ex.: Restaurantes em Curitiba"
            className="h-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-mute"
            maxLength={160}
            autoComplete="off"
          />
        </label>
        <button type="submit" disabled={loading} className={buttonClass("primary", "xl", "lg:px-8")}>
          {loading ? <SpinnerGap size={20} className="animate-spin" /> : "Encontrar empresas"}
          {!loading && <ArrowRight size={18} weight="bold" />}
        </button>
      </div>
      <div className="no-scrollbar mt-2.5 flex items-center gap-2 overflow-x-auto">
        <button type="button" onClick={onToggleFilters} aria-expanded={filtersOpen} className={cn(buttonClass("outline", "sm"), count > 0 && "border-brand/60")}>
          <SlidersHorizontal size={15} /> Filtros
          {count > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[11px] font-semibold text-white">{count}</span>}
          <CaretDown size={12} className={cn("transition-transform", filtersOpen && "rotate-180")} />
        </button>
        <button type="button" onClick={onToggleFilters} className={buttonClass("ghost", "sm", "max-w-[260px]")}>
          <LocIcon size={15} className="text-brand" />
          <span className="truncate">{locationSummary(form, prefs.location?.label ?? null)}</span>
        </button>
        {category && (
          <button type="button" onClick={() => searchActions.setForm({ category: "" })} className={buttonClass("subtle", "sm")} title="Remover categoria">
            {category} ×
          </button>
        )}
        {filters.website === "sem" && (
          <button type="button" onClick={() => searchActions.setFilters({ website: "todos" })} className={buttonClass("subtle", "sm")}>
            Sem site ×
          </button>
        )}
        {filters.whatsapp && (
          <button type="button" onClick={() => searchActions.setFilters({ whatsapp: false })} className={buttonClass("subtle", "sm")}>
            Com WhatsApp ×
          </button>
        )}
      </div>
    </form>
  );
}

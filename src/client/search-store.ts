"use client";

import { useSyncExternalStore } from "react";
import { DEFAULT_FILTERS, type ResultFilters, type SortKey } from "@/lib/filters";
import { parseQuery, type SearchParamsInput } from "@/lib/search";
import type { Enrichment, LatLng, ResultPlace, SavedState } from "@/lib/types";
import { navigate } from "./navigation";

export interface SearchForm {
  q: string;
  category: string;
  customCategory: string;
  scope: "local" | "raio" | "mundial";
  country: string;
  state: string;
  city: string;
  neighborhood: string;
  postalCode: string;
  radiusKm: number;
  sweep: 1 | 2 | 3;
}

export interface SearchState {
  form: SearchForm;
  filters: ResultFilters;
  sort: SortKey;
  status: "idle" | "loading" | "more" | "done" | "error";
  error: string | null;
  errorCode: string | null;
  searchId: string | null;
  description: string | null;
  places: ResultPlace[];
  hasMore: boolean;
  moreLockedByPlan: boolean;
  center: LatLng | null;
  radiusKm: number | null;
  areaLabel: string | null;
  regions: number;
  demo: boolean;
  enriching: { done: number; total: number } | null;
  selectedId: string | null;
}

export const DEFAULT_FORM: SearchForm = {
  q: "",
  category: "",
  customCategory: "",
  scope: "local",
  country: "",
  state: "",
  city: "",
  neighborhood: "",
  postalCode: "",
  radiusKm: 10,
  sweep: 1,
};

const INITIAL: SearchState = {
  form: DEFAULT_FORM,
  filters: DEFAULT_FILTERS,
  sort: "relevancia",
  status: "idle",
  error: null,
  errorCode: null,
  searchId: null,
  description: null,
  places: [],
  hasMore: false,
  moreLockedByPlan: false,
  center: null,
  radiusKm: null,
  areaLabel: null,
  regions: 1,
  demo: false,
  enriching: null,
  selectedId: null,
};

const KEY = "prospecta:busca:v1";
let state: SearchState = INITIAL;
let hydrated = false;
const listeners = new Set<() => void>();
let seq = 0;

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (raw) {
      const saved = JSON.parse(raw) as SearchState;
      state = { ...INITIAL, ...saved, form: { ...DEFAULT_FORM, ...saved.form }, filters: { ...DEFAULT_FILTERS, ...saved.filters }, status: saved.places?.length ? "done" : "idle", enriching: null };
    }
  } catch {
    // sessão indisponível: segue com o estado inicial
  }
}

let persistTimer: ReturnType<typeof setTimeout> | undefined;
function persist() {
  clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    try {
      window.sessionStorage.setItem(KEY, JSON.stringify({ ...state, status: "done", enriching: null }));
    } catch {
      // cheio ou bloqueado: não é crítico
    }
  }, 250);
}

function set(patch: Partial<SearchState> | ((s: SearchState) => Partial<SearchState>)) {
  hydrate();
  state = { ...state, ...(typeof patch === "function" ? patch(state) : patch) };
  listeners.forEach((l) => l());
  persist();
}

export function getSearchState(): SearchState {
  hydrate();
  return state;
}

export function useSearch(): SearchState {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSearchState,
    () => INITIAL,
  );
}

export const searchActions = {
  setForm(patch: Partial<SearchForm>) {
    set((s) => ({ form: { ...s.form, ...patch } }));
  },
  setFilters(patch: Partial<ResultFilters>) {
    set((s) => ({ filters: { ...s.filters, ...patch } }));
  },
  resetFilters() {
    set({ filters: DEFAULT_FILTERS });
  },
  setSort(sort: SortKey) {
    set({ sort });
  },
  select(id: string | null) {
    if (state.selectedId !== id) set({ selectedId: id });
  },
  patchSaved(placeId: string, patch: Partial<SavedState>) {
    set((s) => ({ places: s.places.map((p) => (p.id === placeId ? { ...p, saved: { ...p.saved, ...patch } } : p)) }));
  },
  mergeEnrichment(results: Record<string, Enrichment>) {
    set((s) => ({ places: s.places.map((p) => (results[p.id] ? { ...p, enrichment: results[p.id]! } : p)) }));
  },

  async run(options: { location: { label: string; lat: number; lng: number } | null; onUsage?: (n: number) => void }) {
    const form = state.form;
    const parsed = parseQuery(form.q);
    const filterPatch: Partial<ResultFilters> = {};
    if (parsed.website) filterPatch.website = parsed.website;
    if (parsed.whatsapp) filterPatch.whatsapp = true;
    if (parsed.openNow) filterPatch.openNow = true;

    const hasPlace = [form.country, form.state, form.city, form.neighborhood, form.postalCode].some((v) => v.trim());
    const loc = options.location;
    const params: SearchParamsInput = {
      q: parsed.q,
      category: form.category || undefined,
      customCategory: form.category === "custom" ? form.customCategory : undefined,
      scope: form.scope,
      country: form.country || undefined,
      state: form.state || undefined,
      city: form.city || undefined,
      neighborhood: form.neighborhood || undefined,
      postalCode: form.postalCode || undefined,
      radiusKm: form.radiusKm,
      sweep: form.sweep,
      reference: loc ? { lat: loc.lat, lng: loc.lng } : undefined,
      center: loc && !hasPlace && form.scope !== "mundial" ? { lat: loc.lat, lng: loc.lng, label: loc.label } : undefined,
    };

    const mySeq = ++seq;
    set((s) => ({
      status: "loading",
      error: null,
      errorCode: null,
      places: [],
      selectedId: null,
      filters: { ...s.filters, ...filterPatch },
      enriching: null,
    }));

    try {
      const response = await fetch("/api/search", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(params) });
      const data = await response.json().catch(() => null);
      if (mySeq !== seq) return null;
      if (response.status === 401) {
        navigate(`/entrar?next=${encodeURIComponent(window.location.pathname)}`);
        return null;
      }
      if (!response.ok) {
        set({ status: "error", error: data?.error ?? "Não foi possível pesquisar agora.", errorCode: data?.code ?? null });
        return null;
      }
      set({
        status: "done",
        searchId: data.searchId,
        description: data.description,
        places: data.places,
        hasMore: data.hasMore,
        moreLockedByPlan: data.moreLockedByPlan,
        center: data.center,
        radiusKm: data.radiusKm,
        areaLabel: data.areaLabel,
        regions: data.regions,
        demo: data.demo,
      });
      options.onUsage?.(data.regions);
      return data.places as ResultPlace[];
    } catch {
      if (mySeq === seq) set({ status: "error", error: "Falha de conexão. Verifique sua internet e tente de novo." });
      return null;
    }
  },

  async loadMore() {
    if (!state.searchId || state.status === "more" || !state.hasMore) return null;
    const mySeq = seq;
    set({ status: "more" });
    const response = await fetch(`/api/search/${state.searchId}/more`, { method: "POST" }).catch(() => null);
    const data = await response?.json().catch(() => null);
    if (mySeq !== seq) return null;
    if (!response?.ok) {
      set({ status: "done", error: data?.error ?? "Não foi possível carregar mais." });
      return null;
    }
    const known = new Set(state.places.map((p) => p.id));
    const fresh = (data.places as ResultPlace[]).filter((p) => !known.has(p.id));
    set((s) => ({ status: "done", places: [...s.places, ...fresh], hasMore: data.hasMore }));
    return fresh;
  },

  /** Lê os sites das empresas (e-mail, Instagram, Facebook) em lotes, atualizando a lista aos poucos. */
  async enrich(places: ResultPlace[]) {
    const pending = places.filter((p) => p.website && !p.enrichment);
    if (!pending.length) return;
    const mySeq = seq;
    let done = 0;
    set({ enriching: { done, total: pending.length } });
    for (let i = 0; i < pending.length; i += 8) {
      const batch = pending.slice(i, i + 8);
      const response = await fetch("/api/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ places: batch.map(({ distanceKm: _d, saved: _s, enrichment: _e, ...place }) => place) }),
      }).catch(() => null);
      if (mySeq !== seq) return;
      const data = await response?.json().catch(() => null);
      if (response?.ok && data?.results) searchActions.mergeEnrichment(data.results);
      done += batch.length;
      set({ enriching: done >= pending.length ? null : { done, total: pending.length } });
    }
  },
};

/** Remove os campos de apresentação antes de enviar uma empresa ao servidor. */
export function toPlace(place: ResultPlace) {
  const { distanceKm: _d, saved: _s, enrichment: _e, ...rest } = place;
  return rest;
}

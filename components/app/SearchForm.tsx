"use client";

import { ArrowRight, Crosshair, MagnifyingGlass, MapPin, SpinnerGap, X } from "@phosphor-icons/react";
import { useState } from "react";
import { buttonClass } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

export interface Near {
  lat: number;
  lng: number;
}

interface SearchFormProps {
  what: string;
  where: string;
  near: Near | null;
  radiusKm: number;
  loading: boolean;
  onWhat: (value: string) => void;
  onWhere: (value: string) => void;
  onNear: (value: Near | null) => void;
  onRadius: (value: number) => void;
  onSubmit: () => void;
}

const RADII = [1, 2, 5, 10, 25, 50];

export function SearchForm(props: SearchFormProps) {
  const { what, where, near, radiusKm, loading, onWhat, onWhere, onNear, onRadius, onSubmit } = props;
  const [locating, setLocating] = useState(false);

  function locate() {
    if (!("geolocation" in navigator)) {
      toast("Seu navegador não permite pegar a localização.", "error");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        onNear({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      () => {
        setLocating(false);
        toast("Não foi possível pegar sua localização. Digite a cidade no campo “Onde”.", "error");
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 },
    );
  }

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="flex flex-col gap-2 md:flex-row md:items-stretch"
    >
      <label className="group flex h-12 min-w-0 items-center gap-2.5 rounded-xl border border-line-2 bg-ink px-3.5 focus-within:border-brand md:flex-1">
        <MagnifyingGlass size={18} className="shrink-0 text-mute group-focus-within:text-brand" />
        <span className="sr-only">O que você procura</span>
        <input
          value={what}
          onChange={(event) => onWhat(event.target.value)}
          placeholder="O que você procura? Ex.: dentistas, barbearias, academias"
          className="h-full min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-mute"
          maxLength={120}
          autoComplete="off"
        />
      </label>

      <div className="flex h-12 min-w-0 items-center gap-2.5 rounded-xl border border-line-2 bg-ink pl-3.5 pr-1.5 focus-within:border-brand md:flex-1">
        <MapPin size={18} className="shrink-0 text-mute" />
        <label className="min-w-0 flex-1">
          <span className="sr-only">Onde</span>
          <input
            value={where}
            onChange={(event) => onWhere(event.target.value)}
            placeholder={near ? "Perto de você (ou digite um lugar)" : "Onde? Cidade, bairro, país. Use ; para várias"}
            className="h-11 w-full bg-transparent text-[15px] outline-none placeholder:text-mute"
            maxLength={600}
            autoComplete="off"
          />
        </label>
        {near ? (
          <span className="flex shrink-0 items-center gap-1 rounded-lg bg-brand/15 py-1 pl-2 pr-1 text-xs font-medium text-brand">
            <Crosshair size={14} weight="bold" />
            <select
              value={radiusKm}
              onChange={(event) => onRadius(Number(event.target.value))}
              aria-label="Raio da busca"
              className="bg-transparent text-xs font-medium outline-none"
            >
              {RADII.map((radius) => (
                <option key={radius} value={radius} className="bg-ink text-paper">
                  {radius} km
                </option>
              ))}
            </select>
            <button type="button" onClick={() => onNear(null)} aria-label="Remover “perto de mim”" className="grid h-5 w-5 place-items-center rounded hover:bg-brand/20">
              <X size={12} weight="bold" />
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={locate}
            disabled={locating}
            className={cn(buttonClass("ghost", "sm"), "shrink-0")}
            title="Usar minha localização"
          >
            {locating ? <SpinnerGap size={15} className="animate-spin" /> : <Crosshair size={15} />}
            <span className="hidden lg:inline">Perto de mim</span>
          </button>
        )}
      </div>

      <button type="submit" disabled={loading} className={buttonClass("primary", "lg", "h-12 md:px-7")}>
        {loading ? <SpinnerGap size={18} className="animate-spin" /> : <span>Buscar</span>}
        {!loading && <ArrowRight size={17} weight="bold" />}
      </button>
    </form>
  );
}

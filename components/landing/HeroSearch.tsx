"use client";

import { ArrowRight, MagnifyingGlass, MapPin } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { buttonClass } from "@/components/ui/button";

const QUICK: Array<[string, string]> = [
  ["Dentistas", "São Paulo"],
  ["Barbearias", "Lisboa"],
  ["Academias", "Curitiba"],
  ["Restaurantes", "Miami"],
];

export function HeroSearch() {
  const router = useRouter();
  const [what, setWhat] = useState("");
  const [where, setWhere] = useState("");

  function go(q: string, onde: string) {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (onde.trim()) params.set("onde", onde.trim());
    router.push(`/prospectar${params.size ? `?${params}` : ""}`);
  }

  return (
    <div>
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          go(what, where);
        }}
        className="flex flex-col gap-2 rounded-2xl border border-line-2 bg-ink-2/90 p-2 shadow-[0_30px_80px_-30px_rgba(255,46,46,0.35)] backdrop-blur sm:flex-row"
      >
        <label className="flex h-12 min-w-0 items-center gap-2.5 rounded-xl px-3 focus-within:bg-white/[0.03] sm:flex-1">
          <MagnifyingGlass size={18} className="shrink-0 text-brand" />
          <span className="sr-only">O que você procura</span>
          <input
            value={what}
            onChange={(event) => setWhat(event.target.value)}
            placeholder="Que tipo de empresa?"
            className="h-full min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-mute"
          />
        </label>
        <span className="hidden w-px self-stretch bg-line sm:block" aria-hidden="true" />
        <label className="flex h-12 min-w-0 items-center gap-2.5 rounded-xl px-3 focus-within:bg-white/[0.03] sm:flex-1">
          <MapPin size={18} className="shrink-0 text-mute" />
          <span className="sr-only">Onde</span>
          <input
            value={where}
            onChange={(event) => setWhere(event.target.value)}
            placeholder="Onde? Cidade, bairro, país"
            className="h-full min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-mute"
          />
        </label>
        <button type="submit" className={buttonClass("primary", "lg")}>
          Prospectar <ArrowRight size={17} weight="bold" />
        </button>
      </form>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-[13px]">
        <span className="text-mute">Experimente:</span>
        {QUICK.map(([q, onde]) => (
          <button
            key={q}
            type="button"
            onClick={() => go(q, onde)}
            className="rounded-full border border-line px-3 py-1 text-mute-2 transition-colors hover:border-brand hover:text-paper"
          >
            {q} em {onde}
          </button>
        ))}
      </div>
    </div>
  );
}

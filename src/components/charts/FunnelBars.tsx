"use client";

import { useState } from "react";

/** Barras horizontais de uma série (quantidade por etapa do funil), valor na ponta. */
export function FunnelBars({ data }: { data: Array<{ key: string; label: string; value: number }> }) {
  const [hover, setHover] = useState<string | null>(null);
  const max = Math.max(1, ...data.map((d) => d.value));
  const total = data.reduce((sum, d) => sum + d.value, 0);
  return (
    <ul className="space-y-2.5">
      {data.map((d) => {
        const pct = total ? Math.round((d.value / total) * 100) : 0;
        return (
          <li
            key={d.key}
            tabIndex={0}
            onPointerEnter={() => setHover(d.key)}
            onPointerLeave={() => setHover(null)}
            onFocus={() => setHover(d.key)}
            onBlur={() => setHover(null)}
            className="grid grid-cols-[110px_1fr] items-center gap-3 outline-none"
            aria-label={`${d.label}: ${d.value} leads (${pct}%)`}
          >
            <span className="truncate text-sm text-mute-2">{d.label}</span>
            <span className="flex items-center gap-2">
              <span className="h-5 flex-1">
                <span
                  className="block h-full rounded-r-[4px] bg-brand transition-opacity"
                  style={{ width: `${Math.max(d.value ? 2 : 0, (d.value / max) * 100)}%`, maxHeight: 24, opacity: hover == null || hover === d.key ? 1 : 0.45 }}
                />
              </span>
              <span className="w-16 shrink-0 text-right text-sm font-semibold tabular-nums">
                {d.value.toLocaleString("pt-BR")}
                <span className={`ml-1 text-[11px] font-normal text-mute ${hover === d.key ? "inline" : "hidden"}`}>{pct}%</span>
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

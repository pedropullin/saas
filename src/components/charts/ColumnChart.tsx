"use client";

import { useEffect, useRef, useState } from "react";

export interface ColumnDatum {
  key: string;
  label: string;
  value: number;
}

const HEIGHT = 150;
const AXIS_W = 30;
const TOP = 10;
const BOTTOM = 22;

function niceMax(value: number): number {
  if (value <= 4) return 4;
  const pow = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((s) => s * pow >= value / 2)! * pow;
  return Math.ceil(value / step) * step;
}

/** Colunas de uma série (uma cor), eixo único, tooltip por coluna e foco por teclado. */
export function ColumnChart({ data, title, unit }: { data: ColumnDatum[]; title: string; unit: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry!.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const max = niceMax(Math.max(0, ...data.map((d) => d.value)));
  const plotW = Math.max(0, width - AXIS_W);
  const plotH = HEIGHT - TOP - BOTTOM;
  const band = data.length ? plotW / data.length : 0;
  const barW = Math.max(2, Math.min(24, band - 2));
  const y = (v: number) => TOP + plotH - (v / max) * plotH;
  const ticks = [0, max / 2, max];
  const hovered = hover != null ? data[hover] : null;

  return (
    <div ref={ref} className="relative select-none" role="img" aria-label={`${title}: gráfico de colunas por dia`}>
      {width > 0 && (
        <svg width={width} height={HEIGHT} className="block overflow-visible">
          {ticks.map((t) => (
            <g key={t}>
              <line x1={AXIS_W} x2={width} y1={y(t)} y2={y(t)} stroke="#252525" strokeWidth={1} />
              <text x={AXIS_W - 6} y={y(t) + 3.5} textAnchor="end" className="fill-[#929292] text-[10px] tabular-nums">
                {Math.round(t).toLocaleString("pt-BR")}
              </text>
            </g>
          ))}
          {data.map((d, i) => {
            const x = AXIS_W + i * band + (band - barW) / 2;
            const top = y(d.value);
            const h = TOP + plotH - top;
            const r = Math.min(4, h, barW / 2);
            const path =
              h <= 0
                ? ""
                : `M${x},${TOP + plotH} L${x},${top + r} Q${x},${top} ${x + r},${top} L${x + barW - r},${top} Q${x + barW},${top} ${x + barW},${top + r} L${x + barW},${TOP + plotH} Z`;
            return (
              <g key={d.key}>
                {path && <path d={path} fill="#E50914" opacity={hover == null || hover === i ? 1 : 0.45} />}
                <rect
                  x={AXIS_W + i * band}
                  y={TOP}
                  width={band}
                  height={plotH}
                  fill="transparent"
                  tabIndex={0}
                  aria-label={`${d.label}: ${d.value} ${unit}`}
                  onPointerEnter={() => setHover(i)}
                  onPointerLeave={() => setHover(null)}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover(null)}
                  className="outline-none"
                />
              </g>
            );
          })}
          {[0, Math.floor((data.length - 1) / 2), data.length - 1].map((i) =>
            data[i] ? (
              <text key={i} x={AXIS_W + i * band + band / 2} y={HEIGHT - 6} textAnchor="middle" className="fill-[#929292] text-[10px]">
                {data[i]!.label}
              </text>
            ) : null,
          )}
        </svg>
      )}
      {hovered && hover != null && (
        <div
          className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-lg border border-line-2 bg-ink-2 px-2.5 py-1.5 text-xs shadow-xl"
          style={{ left: Math.min(Math.max(AXIS_W + hover * band + band / 2, 50), width - 50) }}
        >
          <p className="font-semibold text-paper">
            {hovered.value.toLocaleString("pt-BR")} {unit}
          </p>
          <p className="text-mute">{hovered.label}</p>
        </div>
      )}
    </div>
  );
}

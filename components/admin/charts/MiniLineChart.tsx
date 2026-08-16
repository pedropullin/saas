"use client";

import { motion } from "framer-motion";
import type { SeriesPoint } from "@/lib/types";
import { EASE_EDITORIAL } from "@/lib/motion/easing";

const WIDTH = 320;
const HEIGHT = 120;
const PADDING = 8;

export function MiniLineChart({ data }: { data: SeriesPoint[] }) {
  const values = data.map((d) => d.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  const points = data.map((d, i) => {
    const x = PADDING + (i / (data.length - 1)) * (WIDTH - PADDING * 2);
    const y = HEIGHT - PADDING - ((d.value - min) / range) * (HEIGHT - PADDING * 2);
    return { x, y, label: d.label, value: d.value };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1]?.x ?? 0},${HEIGHT} L${points[0]?.x ?? 0},${HEIGHT} Z`;

  return (
    <div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label="Gráfico de linha">
        <defs>
          <linearGradient id="line-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d={areaPath}
          fill="url(#line-fill)"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE_EDITORIAL }}
        />
        <motion.path
          d={linePath}
          fill="none"
          stroke="var(--color-ink)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: EASE_EDITORIAL }}
        />
        {points.map((p) => (
          <circle key={p.label} cx={p.x} cy={p.y} r={2.5} fill="var(--color-accent)" />
        ))}
      </svg>
      <div className="mt-2 flex justify-between text-[0.6875rem] text-neutral-400">
        {data.map((d) => (
          <span key={d.label}>{d.label}</span>
        ))}
      </div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import type { SeriesPoint } from "@/lib/types";
import { EASE_EDITORIAL } from "@/lib/motion/easing";

export function MiniBarChart({ data }: { data: SeriesPoint[] }) {
  const max = Math.max(...data.map((d) => d.value));

  return (
    <div className="flex h-[120px] items-end gap-2.5">
      {data.map((d, i) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
          <motion.div
            className="w-full rounded-t-[3px] bg-ink"
            initial={{ height: 0 }}
            whileInView={{ height: `${(d.value / max) * 96}px` }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE_EDITORIAL, delay: i * 0.04 }}
          />
          <span className="text-[0.6875rem] text-neutral-400">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

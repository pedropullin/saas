"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { EASE_EDITORIAL } from "@/lib/motion/easing";

export function BrandBoardModule({
  label,
  span = 1,
  tone = "paper",
  className,
  children,
}: {
  label: string;
  span?: 1 | 2;
  tone?: "paper" | "ink" | "off-white" | "accent";
  className?: string;
  children: ReactNode;
}) {
  const toneClass = {
    paper: "bg-paper text-ink",
    ink: "bg-ink text-off-white",
    "off-white": "bg-off-white text-ink",
    accent: "bg-accent text-accent-ink",
  }[tone];

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25, ease: EASE_EDITORIAL }}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-md border border-ink/8 p-5",
        span === 2 && "md:col-span-2",
        toneClass,
        className
      )}
    >
      <p
        className={cn(
          "text-label font-medium uppercase tracking-[0.08em]",
          tone === "ink" ? "text-off-white/50" : tone === "accent" ? "text-accent-ink/60" : "text-neutral-500"
        )}
      >
        {label}
      </p>
      <div className="mt-4">{children}</div>
    </motion.div>
  );
}

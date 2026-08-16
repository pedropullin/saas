"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { Designer } from "@/lib/types";
import { EASE_EDITORIAL } from "@/lib/motion/easing";
import { cn } from "@/lib/utils";

const AVAILABILITY_TONE: Record<Designer["availability"], string> = {
  "disponível": "text-accent-dim",
  "com fila": "text-neutral-500",
  "indisponível": "text-neutral-400",
};

export function DesignerCard({ designer }: { designer: Designer }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: EASE_EDITORIAL }}
      className="flex flex-col justify-between rounded-md border border-ink/8 bg-paper p-6"
    >
      <div>
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-[0.9375rem] font-medium text-off-white">
            {designer.initials}
          </div>
          <span className={cn("text-[0.6875rem] font-medium uppercase tracking-[0.06em]", AVAILABILITY_TONE[designer.availability])}>
            {designer.availability}
          </span>
        </div>

        <p className="mt-4 text-[1rem] font-medium text-ink">{designer.name}</p>
        <p className="text-[0.8125rem] text-neutral-500">{designer.specialty}</p>
        <p className="mt-3 text-[0.8125rem] leading-relaxed text-neutral-600">{designer.bio}</p>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-ink/6 pt-4 text-[0.75rem] text-neutral-500">
        <span>{designer.experienceYears} anos</span>
        <span>{designer.projectsCount} projetos</span>
        <span className="font-medium text-ink">★ {designer.rating.toFixed(1)}</span>
      </div>

      <Link
        href={`/app/designers/${designer.id}`}
        className="mt-5 inline-flex items-center justify-center rounded-[3px] border border-ink/15 py-2.5 text-[0.8125rem] font-medium text-ink transition-colors hover:border-ink hover:bg-ink hover:text-off-white"
      >
        Ver designer
      </Link>
    </motion.div>
  );
}

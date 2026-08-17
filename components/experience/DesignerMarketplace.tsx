"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TransitionLink } from "@/components/providers/TransitionLink";
import { designers } from "@/lib/mock/designers";
import { EASE_EDITORIAL } from "@/lib/motion/easing";
import { cn } from "@/lib/utils";

const BLOCK_TONE = ["bg-ink", "bg-[#1b1b12]", "bg-[#232318]", "bg-ink", "bg-[#1b1b12]", "bg-[#232318]"];

export function DesignerMarketplace() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <section id="designers" className="bg-off-white py-32">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <p className="text-label font-medium uppercase tracking-[0.08em] text-neutral-500">Designers</p>
        <h2 className="mt-4 text-h1 font-medium text-ink">Pessoas reais, quando você precisar.</h2>
        <p className="mx-auto mt-4 max-w-md text-body-lg text-neutral-600">
          Um marketplace de designers curados para refinar o que a inteligência começou.
        </p>
      </div>

      <div className="mx-auto mt-16 flex h-[420px] max-w-6xl gap-1.5 overflow-hidden px-4">
        {designers.map((designer, i) => {
          const isActive = active === designer.id;
          return (
            <motion.div
              key={designer.id}
              layout
              onMouseEnter={() => setActive(designer.id)}
              onMouseLeave={() => setActive(null)}
              transition={{ duration: 0.5, ease: EASE_EDITORIAL }}
              data-cursor="view"
              data-cursor-label="Ver"
              className={cn(
                "relative flex min-w-[64px] cursor-pointer flex-col justify-end overflow-hidden rounded-md",
                BLOCK_TONE[i % BLOCK_TONE.length]
              )}
              style={{ flexGrow: isActive ? 4 : 1, flexBasis: 0 }}
            >
              <span className="absolute left-4 top-5 text-[1.75rem] font-semibold text-off-white/15">
                {designer.initials}
              </span>

              <motion.div
                animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 16 }}
                transition={{ duration: 0.3, ease: EASE_EDITORIAL }}
                className="relative z-10 p-6"
              >
                <p className="whitespace-nowrap text-lg font-medium text-off-white">{designer.name}</p>
                <p className="mt-1 whitespace-nowrap text-[0.8125rem] text-off-white/55">{designer.specialty}</p>
                <p className="mt-3 max-w-[220px] text-[0.75rem] leading-relaxed text-off-white/40">{designer.bio}</p>
                <div className="mt-4 flex gap-4 text-[0.75rem] text-off-white/50">
                  <span>{designer.projectsCount} projetos</span>
                  <span>★ {designer.rating.toFixed(1)}</span>
                </div>
              </motion.div>

              {!isActive && (
                <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rotate-90 whitespace-nowrap text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-off-white/35">
                  {designer.name.split(" ")[0]}
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-10 text-center">
        <TransitionLink
          href="/app/designers"
          data-cursor="v"
          className="inline-flex items-center justify-center rounded-[3px] border border-ink/15 px-6 py-3 text-[0.8125rem] font-medium text-ink transition-colors hover:border-ink hover:bg-ink hover:text-off-white"
        >
          Ver todos os designers
        </TransitionLink>
      </div>
    </section>
  );
}

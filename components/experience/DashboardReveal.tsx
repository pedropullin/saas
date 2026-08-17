"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { VMark } from "@/components/ui/VMark";
import { identities } from "@/lib/mock/identities";
import { EASE_EDITORIAL } from "@/lib/motion/easing";
import { mapRange } from "@/lib/motion/mapRange";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Projetos", active: true },
  { label: "Identidades" },
  { label: "Brand Books" },
  { label: "Designers" },
  { label: "Biblioteca" },
  { label: "Configurações" },
];

export function DashboardReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 0.15"] });
  const scale = useTransform(scrollYProgress, (v) => mapRange(v, [0, 1], [0.82, 1]));
  const opacity = useTransform(scrollYProgress, (v) => mapRange(v, [0, 0.7], [0.4, 1]));
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section id="produto" className="bg-ink py-32">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <p className="text-label font-medium uppercase tracking-[0.08em] text-off-white/40">O produto</p>
        <h2 className="mt-4 text-h1 font-medium text-off-white">Isso é a VEYRO por dentro.</h2>
        <p className="mx-auto mt-4 max-w-md text-body-lg text-off-white/55">
          Cada identidade gerada vive em um painel de trabalho real — organizado, versionado,
          pronto para o time inteiro.
        </p>
      </div>

      <div ref={ref} className="relative mx-auto mt-16 max-w-6xl px-4">
        <motion.div
          style={{ scale, opacity }}
          className="overflow-hidden rounded-lg border border-off-white/10 bg-[#101009] shadow-[0_60px_120px_rgba(0,0,0,0.5)]"
        >
          <div className="flex items-center gap-2 border-b border-off-white/8 px-5 py-3.5">
            <span className="h-2.5 w-2.5 rounded-full bg-off-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-off-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-off-white/15" />
            <span className="ml-3 text-[0.75rem] text-off-white/35">app.veyro.com/projetos</span>
          </div>

          <div className="flex">
            <aside className="hidden w-48 shrink-0 border-r border-off-white/8 p-4 sm:block">
              <div className="mb-6 flex items-center gap-2 px-2">
                <VMark variant="solid" size={16} tone="accent" />
                <span className="text-[0.8125rem] font-medium text-off-white">veyro</span>
              </div>
              <nav className="flex flex-col gap-1">
                {NAV.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    className={cn(
                      "rounded-[4px] px-3 py-2 text-left text-[0.8125rem] font-medium transition-colors",
                      item.active ? "bg-accent text-accent-ink" : "text-off-white/50 hover:bg-off-white/5 hover:text-off-white"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </aside>

            <div className="min-w-0 flex-1 p-6">
              <div className="mb-5 flex items-center justify-between">
                <p className="text-[0.9375rem] font-medium text-off-white">5 projetos ativos</p>
                <span className="rounded-[3px] bg-accent px-3 py-1.5 text-[0.75rem] font-medium text-accent-ink">
                  + Nova identidade
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                {identities.map((identity) => {
                  const isHovered = hovered === identity.id;
                  return (
                    <motion.div
                      key={identity.id}
                      onMouseEnter={() => setHovered(identity.id)}
                      onMouseLeave={() => setHovered(null)}
                      animate={{ y: isHovered ? -6 : 0, scale: isHovered ? 1.03 : 1 }}
                      transition={{ duration: 0.3, ease: EASE_EDITORIAL }}
                      data-cursor="view"
                      data-cursor-label="Abrir"
                      className="cursor-pointer rounded-[6px] border border-off-white/8 bg-off-white/[0.03] p-4"
                    >
                      <div className="flex items-center justify-between">
                        <VMark variant={identity.symbolVariant} size={20} tone="paper" />
                        <span className="text-[0.6875rem] uppercase tracking-[0.06em] text-off-white/30">
                          {identity.segment}
                        </span>
                      </div>
                      <p className="mt-4 text-[0.9375rem] font-medium lowercase text-off-white">
                        {identity.brandName}
                      </p>
                      <motion.div
                        initial={false}
                        animate={{ opacity: isHovered ? 1 : 0, height: isHovered ? "auto" : 0 }}
                        transition={{ duration: 0.25, ease: EASE_EDITORIAL }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 flex gap-1">
                          {identity.colors.map((c) => (
                            <span key={c.hex} className="h-3 w-3 rounded-[2px]" style={{ backgroundColor: c.hex }} />
                          ))}
                        </div>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

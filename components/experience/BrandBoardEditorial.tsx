"use client";

import { type PointerEvent, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";
import { VMark } from "@/components/ui/VMark";
import { cn } from "@/lib/utils";

function ParallaxLayer({
  depth,
  px,
  py,
  className,
  children,
}: {
  depth: number;
  px: MotionValue<number>;
  py: MotionValue<number>;
  className?: string;
  children: ReactNode;
}) {
  const lx = useTransform(px, (v) => v * depth);
  const ly = useTransform(py, (v) => v * depth);
  return (
    <motion.div style={{ x: lx, y: ly }} className={cn("absolute", className)}>
      {children}
    </motion.div>
  );
}

const PALETTE = [
  { name: "Grafite", hex: "#17170F" },
  { name: "Areia", hex: "#F5F4EF" },
  { name: "Concreto", hex: "#A8A79B" },
  { name: "Lima", hex: "#C6F13A" },
];

export function BrandBoardEditorial() {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const px = useSpring(rawX, { stiffness: 60, damping: 18 });
  const py = useSpring(rawY, { stiffness: 60, damping: 18 });

  function handleMove(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    rawX.set(((event.clientX - rect.left) / rect.width - 0.5) * 60);
    rawY.set(((event.clientY - rect.top) / rect.height - 0.5) * 60);
  }

  return (
    <section id="recursos" className="bg-off-white py-32">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <p className="text-label font-medium uppercase tracking-[0.08em] text-neutral-500">O sistema</p>
        <h2 className="mt-4 text-h1 font-medium text-ink">Um brand board completo.</h2>
        <p className="mx-auto mt-4 max-w-md text-body-lg text-neutral-600">
          Cada identidade sai com o sistema inteiro — não apenas um logotipo.
        </p>
      </div>

      <div
        onPointerMove={handleMove}
        className="relative mx-auto mt-16 h-[880px] max-w-[1400px] px-4 md:h-[1040px]"
      >
        {/* giant background symbol */}
        <ParallaxLayer depth={0.25} px={px} py={py} className="left-[2%] top-0 hidden lg:block">
          <VMark variant="outline" size={420} tone="ink" className="opacity-[0.06]" />
        </ParallaxLayer>

        {/* wordmark lockup — large */}
        <ParallaxLayer depth={0.5} px={px} py={py} className="left-1/2 top-[6%] -translate-x-1/2">
          <div className="flex items-center gap-4">
            <VMark variant="cropped" size={64} tone="ink" />
            <span className="text-[5rem] font-semibold leading-none tracking-[-0.03em] text-ink md:text-[7rem]">
              veyro
            </span>
          </div>
        </ParallaxLayer>

        {/* typography specimen */}
        <ParallaxLayer
          depth={0.4}
          px={px}
          py={py}
          className="left-[4%] top-[30%] w-56 border-l border-ink/15 pl-5 md:top-[26%]"
        >
          <p className="text-8xl font-medium leading-none text-ink">Aa</p>
          <p className="mt-4 text-[0.75rem] uppercase tracking-[0.08em] text-neutral-500">
            Grotesco editorial
          </p>
          <p className="mt-1 text-[0.8125rem] text-neutral-600">Display &amp; corpo de texto</p>
        </ParallaxLayer>

        {/* palette strip */}
        <ParallaxLayer depth={0.65} px={px} py={py} className="right-[6%] top-[20%] flex gap-2 md:top-[16%]">
          {PALETTE.map((c) => (
            <div key={c.hex} className="flex flex-col items-center gap-2">
              <span className="h-24 w-12 rounded-[3px] shadow-subtle md:h-32 md:w-14" style={{ backgroundColor: c.hex }} />
              <span className="text-[0.625rem] uppercase tracking-[0.06em] text-neutral-500">{c.name}</span>
            </div>
          ))}
        </ParallaxLayer>

        {/* pattern block — tiled small V marks */}
        <ParallaxLayer
          depth={0.3}
          px={px}
          py={py}
          className="bottom-[8%] left-[6%] grid w-40 grid-cols-4 gap-2 rounded-md bg-ink p-5"
        >
          {Array.from({ length: 16 }).map((_, i) => (
            <VMark key={i} variant="mono" size={14} tone="paper" className="opacity-70" />
          ))}
        </ParallaxLayer>

        {/* components row */}
        <ParallaxLayer
          depth={0.55}
          px={px}
          py={py}
          className="bottom-[26%] left-[38%] flex items-center gap-3 md:bottom-[30%]"
        >
          <span className="rounded-[3px] bg-ink px-4 py-2 text-[0.75rem] font-medium text-off-white">Botão</span>
          <span className="rounded-full border border-ink/20 px-4 py-2 text-[0.75rem] font-medium text-ink">Tag</span>
          <span className="h-8 w-8 rounded-full bg-accent" />
        </ParallaxLayer>

        {/* application mockup — tilted card */}
        <ParallaxLayer
          depth={0.7}
          px={px}
          py={py}
          className="bottom-[4%] right-[4%] w-64 -rotate-6 overflow-hidden rounded-md border border-ink/10 bg-ink shadow-lifted md:w-72"
        >
          <div className="flex items-center justify-between px-5 py-6">
            <VMark variant="split" size={22} tone="paper" />
            <span className="text-[0.625rem] uppercase tracking-[0.08em] text-off-white/40">Cartão</span>
          </div>
          <p className="px-5 pb-6 text-lg font-medium lowercase text-off-white">veyro</p>
          <div className="grid grid-cols-4">
            {PALETTE.map((c) => (
              <div key={c.hex} className="h-4" style={{ backgroundColor: c.hex }} />
            ))}
          </div>
        </ParallaxLayer>

        {/* grid / layout system module */}
        <ParallaxLayer
          depth={0.42}
          px={px}
          py={py}
          className="right-[26%] top-[52%] hidden grid-cols-3 gap-1.5 lg:grid"
        >
          {Array.from({ length: 9 }).map((_, i) => (
            <span key={i} className="h-6 w-6 rounded-[2px] border border-ink/15" />
          ))}
        </ParallaxLayer>
      </div>
    </section>
  );
}

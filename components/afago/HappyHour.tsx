"use client";

import { motion } from "framer-motion";
import { PlaceholderImage } from "@/components/afago/PlaceholderImage";
import { useTilt } from "@/hooks/useTilt";
import { EASE_EDITORIAL } from "@/lib/motion/easing";
import { Martini, ForkKnife, UsersThree } from "@phosphor-icons/react";

const CARDS = [
  { label: "Drinks autorais e clássicos", icon: Martini, tone: "terracotta" as const, from: -60 },
  { label: "Petiscos para dividir", icon: ForkKnife, tone: "char" as const, from: 60 },
  { label: "Mesa cheia, papo bom", icon: UsersThree, tone: "void" as const, from: -60 },
];

function TiltCard({ card, delay }: { card: (typeof CARDS)[number]; delay: number }) {
  const { ref, rotateX, rotateY, onPointerMove, onPointerLeave } = useTilt<HTMLDivElement>(5);
  const IconCmp = card.icon;

  return (
    <motion.div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      initial={{ opacity: 0, x: card.from }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-15% 0px" }}
      transition={{ duration: 0.9, ease: EASE_EDITORIAL, delay }}
      whileHover={{ scale: 1.02 }}
      className="relative aspect-[3/4] w-full max-w-xs"
    >
      <PlaceholderImage
        label={card.label}
        tone={card.tone}
        icon={IconCmp}
        className="h-full w-full rounded-sm shadow-[0_30px_80px_rgba(0,0,0,0.5)]"
      />
    </motion.div>
  );
}

export function HappyHour() {
  return (
    <section className="relative overflow-hidden bg-afago-void py-28 sm:py-40">
      <motion.h2
        aria-hidden
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2 }}
        className="pointer-events-none absolute inset-x-0 top-10 select-none text-center font-serif text-[18vw] font-normal italic leading-none text-transparent [-webkit-text-stroke:1px_var(--color-afago-line)] sm:text-[13vw]"
      >
        Happy Hour
      </motion.h2>

      <div className="relative mx-auto w-full max-w-[1440px] px-6 pt-16 text-center md:px-10 sm:pt-20">
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.32em] text-afago-terracotta-soft">
          Todo dia tem motivo
        </p>
        <h2 className="mt-4 font-serif text-afago-h1 text-afago-cream">Happy Hour</h2>
        <p className="mx-auto mt-4 max-w-md font-serif text-lg italic text-afago-cream-dim/80 sm:text-xl">
          Para dividir a mesa. Não o momento.
        </p>
      </div>

      <div className="relative mx-auto mt-16 flex w-full max-w-[1440px] flex-col items-center justify-center gap-8 px-6 sm:mt-20 sm:flex-row sm:items-end sm:gap-6 md:px-10">
        {CARDS.map((card, i) => (
          <TiltCard key={card.label} card={card} delay={i * 0.15} />
        ))}
      </div>
    </section>
  );
}

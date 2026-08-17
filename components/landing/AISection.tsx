"use client";

import { useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import type { PointerEvent as ReactPointerEvent } from "react";
import { Container } from "@/components/ui/Container";
import { VMark } from "@/components/ui/VMark";
import { RevealLines } from "@/components/landing/TextReveal";
import { BRAND_DIRECTIONS } from "@/lib/mock/landing";
import { EASE_EDITORIAL } from "@/lib/motion/easing";
import { cn } from "@/lib/utils";

const HALO = BRAND_DIRECTIONS[1]!;
const [DEEP, LINEN, CLAY, SAGE] = [
  HALO.palette[0]!.hex,
  HALO.palette[1]!.hex,
  HALO.palette[2]!.hex,
  HALO.palette[3]!.hex,
];

/**
 * Section 4 — the differentiator, shown rather than claimed.
 *
 * One artwork, two states: the version the AI produces and the version a
 * designer finishes. Scrolling wipes from one to the other; on a fine pointer
 * the cursor takes over the wipe, which makes the comparison something the
 * visitor performs instead of watches.
 */
export function AISection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [engaged, setEngaged] = useState(false);
  const hovering = useRef(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 80%", "end 60%"],
  });

  const raw = useMotionValue(0.12);
  const split = useSpring(raw, { stiffness: 130, damping: 26, mass: 0.4 });

  // Scroll owns the wipe until the pointer enters the card.
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (hovering.current) return;
    raw.set(0.12 + Math.min(1, Math.max(0, (p - 0.15) / 0.5)) * 0.5);
  });

  const clipRefined = useTransform(split, (v) => `inset(0 ${(1 - v) * 100}% 0 0)`);
  const handleX = useTransform(split, (v) => `${v * 100}%`);

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reducedMotion || event.pointerType !== "mouse") return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    hovering.current = true;
    if (!engaged) setEngaged(true);
    const ratio = (event.clientX - rect.left) / rect.width;
    raw.set(Math.min(0.94, Math.max(0.06, ratio)));
  };

  const onPointerLeave = () => {
    hovering.current = false;
    setEngaged(false);
    raw.set(0.5);
  };

  return (
    <section
      ref={sectionRef}
      data-nav-theme="dark"
      className="relative overflow-hidden bg-ink py-24 text-off-white md:py-36"
    >
      <div aria-hidden className="blueprint-grid-invert mask-radial-fade absolute inset-0" />

      <Container className="relative">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-end lg:gap-20">
          <div>
            <p className="text-label font-medium uppercase tracking-[0.14em] text-off-white/40">
              O diferencial
            </p>
            <RevealLines
              as="h2"
              className="mt-5 text-display font-medium"
              lines={[
                <>
                  AI <span className="text-accent">+</span> Human
                </>,
              ]}
            />
          </div>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-12% 0px" }}
            transition={{ duration: 0.8, ease: EASE_EDITORIAL, delay: 0.15 }}
            className="max-w-lg text-body-lg leading-relaxed text-off-white/60 text-pretty"
          >
            A inteligência artificial resolve o que é sistemático: estrutura, coerência, velocidade.
            O designer resolve o que é humano: intenção, nuance, exceção. A VEYRO entrega os dois em
            um único projeto.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 1, ease: EASE_EDITORIAL }}
          className="mt-14 md:mt-20"
        >
          <div
            ref={cardRef}
            onPointerMove={onPointerMove}
            onPointerLeave={onPointerLeave}
            className="relative aspect-[16/11] w-full select-none overflow-hidden rounded-md border border-off-white/10 sm:aspect-[16/8]"
          >
            {/* base — what the model ships */}
            <Poster
              tone="ai"
              label="AI · primeira versão"
              caption="Gerado em 3 min 12 s"
            />

            {/* refined — what a designer ships */}
            <motion.div
              style={{ clipPath: clipRefined }}
              className="absolute inset-0 will-change-[clip-path]"
            >
              <Poster
                tone="human"
                label="Human · refinamento"
                caption="Cecília Amaral · 2 rodadas"
              />
            </motion.div>

            {/* wipe handle */}
            <motion.div
              aria-hidden
              style={{ x: handleX }}
              className="pointer-events-none absolute inset-y-0 left-0 w-full"
            >
              <div className="absolute inset-y-0 left-0 w-px -translate-x-1/2 bg-ink/25" />
              <div
                className={cn(
                  "absolute left-0 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-ink/15 bg-off-white/90 text-ink shadow-subtle transition-opacity duration-500",
                  engaged ? "opacity-0" : "opacity-100"
                )}
              >
                <svg width="16" height="10" viewBox="0 0 16 10" fill="none" aria-hidden>
                  <path
                    d="M5.5 1 2 5l3.5 4M10.5 1 14 5l-3.5 4"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </motion.div>
          </div>

          <p className="mt-4 text-center text-[0.75rem] text-off-white/35">
            <span className="hidden md:inline">
              Mova o cursor sobre a peça para comparar as duas versões
            </span>
            <span className="md:hidden">Role para comparar as duas versões</span>
          </p>
        </motion.div>

        <div className="mt-16 grid gap-px overflow-hidden rounded-md border border-off-white/10 bg-off-white/10 md:mt-20 md:grid-cols-2">
          <Column
            title="O que a IA resolve"
            items={[
              "Direção visual coerente com o briefing",
              "Sistema completo em minutos, não em semanas",
              "Variações, testes e aplicações sem custo marginal",
              "Documentação gerada junto com a marca",
            ]}
          />
          <Column
            title="O que o designer resolve"
            items={[
              "Ajuste ótico de símbolo, peso e espaçamento",
              "Decisões de exceção que fogem do sistema",
              "Adequação a mercado, cultura e concorrência",
              "Assinatura profissional na entrega final",
            ]}
          />
        </div>
      </Container>
    </section>
  );
}

function Column({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-ink p-7 md:p-9">
      <div className="flex items-center gap-2.5">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
        <p className="text-label font-medium uppercase tracking-[0.12em] text-off-white/50">
          {title}
        </p>
      </div>
      <ul className="mt-5">
        {items.map((item) => (
          <li
            key={item}
            className="border-t border-off-white/10 py-3.5 text-[0.9375rem] leading-relaxed text-off-white/75 first:border-0 first:pt-0"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * The same poster twice, both filling the whole frame so any wipe position
 * compares like with like. The refined state differs the way real refinement
 * does — optical sizing, a centred lockup, hierarchy in the palette, one extra
 * tone — rather than being a different design.
 */
function Poster({
  tone,
  label,
  caption,
}: {
  tone: "ai" | "human";
  label: string;
  caption: string;
}) {
  const refined = tone === "human";
  const palette = refined ? [DEEP, "#8A6A4F", CLAY, SAGE, LINEN] : [DEEP, CLAY, SAGE, LINEN];

  return (
    <div
      className="absolute inset-0 flex flex-col justify-between p-6 sm:p-9"
      style={{ backgroundColor: refined ? LINEN : "#EAE6DF", color: DEEP }}
    >
      {/* Each version keeps its tag on its own side of the wipe, so whichever
          slice you are looking at names itself. */}
      <div className={cn("flex", refined ? "justify-start text-left" : "justify-end text-right")}>
        <div>
          <p className="whitespace-nowrap text-[0.625rem] font-medium uppercase tracking-[0.14em] opacity-55">
            {label}
          </p>
          <p className="mt-1 whitespace-nowrap text-[0.625rem] uppercase tracking-[0.1em] opacity-35">
            {caption}
          </p>
        </div>
      </div>

      {/* centred lockup — the piece the wipe is actually comparing */}
      <div className="flex flex-1 items-center justify-center">
        <div className={cn("flex items-center", refined ? "gap-5" : "gap-3.5")}>
          <VMark
            variant={refined ? "cropped" : "solid"}
            size={refined ? 58 : 50}
            tone="current"
            className={refined ? "translate-y-[2px]" : undefined}
          />
          <div>
            <p
              className={cn(
                "font-semibold lowercase leading-none",
                refined
                  ? "text-[3rem] tracking-[-0.055em] sm:text-[4rem]"
                  : "text-[2.75rem] tracking-[-0.015em] sm:text-[3.75rem]"
              )}
            >
              halo
            </p>
            <p
              className={cn(
                "mt-3 whitespace-nowrap uppercase",
                refined
                  ? "text-[0.6875rem] tracking-[0.34em] opacity-55"
                  : "text-[0.6875rem] tracking-[0.12em] opacity-40"
              )}
            >
              skincare essencial
            </p>
          </div>
        </div>
      </div>

      <div>
        {refined && <div className="mb-4 h-px w-full bg-current opacity-15" />}
        <div className={cn("flex items-end gap-1.5", !refined && "mb-[3px]")}>
          {palette.map((hex, index) => (
            <span
              key={`${hex}-${index}`}
              className={cn(
                "rounded-[2px] ring-1 ring-inset ring-black/10",
                refined ? "h-10" : "h-8",
                // hierarchy in the refined palette; equal weights in the raw one
                refined && index === 0 ? "flex-[2.2]" : "flex-1"
              )}
              style={{ backgroundColor: hex }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useRef, useState, type ReactNode } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useSafeReducedMotion } from "@/hooks/useSafeReducedMotion";
import { Container } from "@/components/ui/Container";
import { VMark } from "@/components/ui/VMark";
import { BUILD_LAYERS, BRAND_DIRECTIONS } from "@/lib/mock/landing";
import { cn } from "@/lib/utils";

const NORTE = BRAND_DIRECTIONS[0]!;
const [INK, SURFACE, MID, SIGNAL] = [
  NORTE.palette[0]!.hex,
  NORTE.palette[1]!.hex,
  NORTE.palette[2]!.hex,
  NORTE.palette[3]!.hex,
];

/** Scroll position at which each layer starts arriving. */
const CUES = [0.06, 0.24, 0.42, 0.58, 0.76];

/**
 * Section 3 — an identity assembling itself on a sticky canvas.
 *
 * Scroll drives one progress value; every block on the board maps its own
 * opacity and lift off it. Nothing is mounted or unmounted mid-sequence, so
 * the board never reflows while it fills in.
 */
export function BuildSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  // Smoothing the scroll value also keeps every layer on the same JS-driven
  // read: a raw scroll value wired straight into `style` gets handed to a
  // native scroll timeline whose range doesn't match this section's, which
  // desynchronises the board from the step list beside it.
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 34, mass: 0.4 });

  const [phase, setPhase] = useState(0);
  useMotionValueEvent(progress, "change", (p) => {
    let next = 0;
    for (let i = 0; i < CUES.length; i += 1) {
      if (p >= CUES[i]!) next = i;
    }
    setPhase((prev) => (prev === next ? prev : next));
  });

  return (
    <section ref={sectionRef} className="relative h-[280vh] md:h-[360vh]">
      <div className="sticky top-0 flex h-dvh flex-col justify-center overflow-hidden border-y border-ink/8 bg-off-white py-20">
        <Container className="grid w-full gap-8 lg:grid-cols-[minmax(0,0.62fr)_minmax(0,1fr)] lg:items-center lg:gap-20">
          <div>
            <p className="text-label font-medium uppercase tracking-[0.14em] text-neutral-500">
              A construção
            </p>
            <h2 className="mt-4 max-w-md text-h2 font-medium text-ink text-balance">
              Cada peça entra no lugar certo.
            </h2>
            <p className="mt-4 hidden max-w-sm text-[0.9375rem] leading-relaxed text-neutral-600 md:block">
              O sistema é construído em camadas — e cada camada respeita as decisões da anterior. É
              por isso que o resultado parece desenhado, não sorteado.
            </p>

            <ol className="mt-8 hidden gap-0 lg:block">
              {BUILD_LAYERS.map((layer, index) => (
                <li key={layer.id}>
                  <div
                    className={cn(
                      "flex items-center gap-4 border-t border-ink/8 py-3 transition-colors duration-500",
                      index <= phase ? "text-ink" : "text-neutral-300"
                    )}
                  >
                    <span className="text-[0.6875rem] font-medium tabular-nums">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[0.9375rem] font-medium">{layer.label}</span>
                    <span className="ml-auto text-[0.75rem] text-neutral-400">{layer.caption}</span>
                    <span
                      aria-hidden
                      className={cn(
                        "h-1.5 w-1.5 rounded-full transition-colors duration-500",
                        index < phase
                          ? "bg-neutral-300"
                          : index === phase
                            ? "bg-accent"
                            : "bg-transparent"
                      )}
                    />
                  </div>
                </li>
              ))}
            </ol>

            {/* compact phase strip for tablet and phone */}
            <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 lg:hidden">
              {BUILD_LAYERS.map((layer, index) => (
                <span
                  key={layer.id}
                  className={cn(
                    "text-[0.75rem] font-medium transition-colors duration-500",
                    index <= phase ? "text-ink" : "text-neutral-300"
                  )}
                >
                  {layer.label}
                </span>
              ))}
            </div>
          </div>

          <Board progress={progress} />
        </Container>
      </div>
    </section>
  );
}

function Board({ progress }: { progress: MotionValue<number> }) {
  return (
    <div
      className="relative overflow-hidden rounded-md border border-ink/10 p-4 shadow-subtle sm:p-6"
      style={{ backgroundColor: SURFACE, color: INK }}
      data-cursor="board"
      data-cursor-label="Brand board"
    >
      <div className="flex items-center justify-between text-[0.5625rem] font-medium uppercase tracking-[0.14em] opacity-40">
        <span>Brand board</span>
        <span>norte — v1.0</span>
      </div>

      <div className="mt-4 grid gap-2.5 sm:gap-3">
        {/* logo + typography */}
        <div className="grid gap-2.5 sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] sm:gap-3">
          <Layer progress={progress} cue={CUES[0]!} label="Logotipo">
            <div className="flex items-center gap-3">
              <VMark variant="solid" size={32} tone="current" />
              <span className="text-[1.625rem] font-semibold lowercase leading-none tracking-[-0.04em] sm:text-[2rem]">
                norte
              </span>
            </div>
            <p className="mt-3 text-[0.6875rem] uppercase tracking-[0.12em] opacity-45">
              Arquitetura · desde 2019
            </p>
          </Layer>

          <Layer progress={progress} cue={CUES[2]!} label="Tipografia">
            <div className="flex items-baseline justify-between">
              <span className="text-[2rem] font-medium leading-none tracking-[-0.04em]">Aa</span>
              <span className="text-[0.625rem] opacity-45">64 / 16</span>
            </div>
            <p className="mt-3 text-[0.6875rem] leading-relaxed opacity-55">
              Geist Medium · Geist Regular
            </p>
          </Layer>
        </div>

        {/* palette */}
        <Layer progress={progress} cue={CUES[1]!} label="Paleta">
          <div className="flex items-end gap-2">
            {NORTE.palette.map((color, index) => (
              <div key={color.hex} className={cn("flex-1", index === 0 && "flex-[1.6]")}>
                <div
                  className="h-11 w-full rounded-[3px] ring-1 ring-inset ring-black/5 sm:h-14"
                  style={{ backgroundColor: color.hex }}
                />
                <div className="mt-2">
                  <p className="truncate text-[0.625rem] leading-tight opacity-60">{color.name}</p>
                  <p className="hidden truncate text-[0.5625rem] uppercase leading-tight opacity-30 sm:block">
                    {color.hex}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Layer>

        {/* applications */}
        <Layer progress={progress} cue={CUES[3]!} label="Aplicações">
          <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
            <Application bg={INK}>
              <span style={{ color: SURFACE }} className="flex">
                <VMark variant="mono" size={16} tone="current" />
              </span>
            </Application>
            <Application bg={MID}>
              <span
                className="text-[0.625rem] font-semibold lowercase tracking-[-0.02em]"
                style={{ color: SURFACE }}
              >
                norte
              </span>
            </Application>
            <Application bg={SIGNAL}>
              <span style={{ color: INK }} className="flex">
                <VMark variant="cropped" size={16} tone="current" />
              </span>
            </Application>
            <Application bg="rgba(255,255,255,0.45)">
              <div className="flex w-full flex-col gap-1 px-3">
                <span className="h-[2px] w-full rounded-full bg-current opacity-20" />
                <span className="h-[2px] w-2/3 rounded-full bg-current opacity-20" />
              </div>
            </Application>
          </div>
        </Layer>

        {/* brand book */}
        <Layer progress={progress} cue={CUES[4]!} label="Brand Book">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              {["Uso do símbolo", "Área de respiro", "Cor e contraste"].map((spread) => (
                <div
                  key={spread}
                  className="hidden h-10 w-14 flex-col justify-end rounded-[3px] p-1.5 ring-1 ring-inset ring-black/5 sm:flex"
                  style={{ backgroundColor: SURFACE }}
                >
                  <span className="h-[2px] w-6 rounded-full bg-current opacity-20" />
                  <span className="mt-1 h-[2px] w-9 rounded-full bg-current opacity-[0.12]" />
                </div>
              ))}
            </div>
            <div className="min-w-0">
              <p className="text-[0.8125rem] font-medium">Brand Book completo</p>
              <p className="truncate text-[0.6875rem] opacity-55">
                24 páginas de diretrizes, prontas para compartilhar
              </p>
            </div>
          </div>
        </Layer>
      </div>
    </div>
  );
}

/**
 * One board block. The frame and its label are always on the board — the
 * canvas reads as a wireframe waiting to be filled — and only the artwork
 * inside fades and lifts in, driven by the section's scroll value.
 */
function Layer({
  progress,
  cue,
  label,
  className,
  children,
}: {
  progress: MotionValue<number>;
  cue: number;
  label: string;
  className?: string;
  children: ReactNode;
}) {
  const reducedMotion = useSafeReducedMotion();
  const opacity = useTransform(progress, [cue, cue + 0.07], [0, 1]);
  const y = useTransform(progress, [cue, cue + 0.1], [22, 0]);

  return (
    <div
      className={cn(
        "rounded-[6px] bg-white/25 p-3.5 ring-1 ring-inset ring-black/[0.05] sm:p-4",
        className
      )}
    >
      <p className="text-[0.5625rem] font-medium uppercase tracking-[0.14em] opacity-30">{label}</p>
      {/* Reduced motion gets the finished board rather than a build that only
          resolves if you keep scrolling. */}
      <motion.div style={reducedMotion ? undefined : { opacity, y }} className="mt-2.5">
        {children}
      </motion.div>
    </div>
  );
}

function Application({ bg, children }: { bg: string; children: ReactNode }) {
  return (
    <div
      className="flex aspect-[4/3] items-center justify-center rounded-[4px] ring-1 ring-inset ring-black/5"
      style={{ backgroundColor: bg }}
    >
      {children}
    </div>
  );
}

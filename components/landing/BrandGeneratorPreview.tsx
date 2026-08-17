"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { useSafeReducedMotion } from "@/hooks/useSafeReducedMotion";
import { VMark } from "@/components/ui/VMark";
import { useGenerationSequence } from "@/hooks/useGenerationSequence";
import { BRAND_DIRECTIONS, type BrandDirection } from "@/lib/mock/landing";
import type { GenerationStep } from "@/lib/types";
import { EASE_EDITORIAL } from "@/lib/motion/easing";
import { cn } from "@/lib/utils";

/** Short enough to finish while the hero is still on screen. */
const STEPS: GenerationStep[] = [
  { id: "briefing", label: "Lendo o briefing", durationMs: 900 },
  { id: "direction", label: "Definindo direção", durationMs: 850 },
  { id: "palette", label: "Construindo paleta", durationMs: 800 },
  { id: "type", label: "Escolhendo tipografia", durationMs: 750 },
  { id: "applications", label: "Aplicando o sistema", durationMs: 900 },
];

/** Reveal order of the canvas modules, keyed to the step that produces them. */
const REVEAL_AT = { logo: 1, palette: 2, type: 3, applications: 4 } as const;

/** Types `text` out one character at a time; returns it whole when disabled. */
function useTypewriter(text: string, enabled: boolean, speed = 55) {
  const [count, setCount] = useState(0);
  const [typedText, setTypedText] = useState(text);

  // Switching brand directions restarts the typing — adjusting state during
  // render is the documented way to reset on a prop change, and it avoids the
  // extra commit an effect would cost.
  if (typedText !== text) {
    setTypedText(text);
    setCount(0);
  }

  useEffect(() => {
    if (!enabled) return;
    let index = 0;
    const id = setInterval(() => {
      index += 1;
      setCount(index);
      if (index >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, enabled, speed]);

  return enabled ? text.slice(0, count) : text;
}

export function BrandGeneratorPreview({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });
  const reducedMotion = useSafeReducedMotion();

  const [directionIndex, setDirectionIndex] = useState(0);
  const direction = BRAND_DIRECTIONS[directionIndex] ?? BRAND_DIRECTIONS[0]!;

  const { stepIndex, currentStep, progress, isDone, restart } = useGenerationSequence(STEPS, {
    autoStart: inView && !reducedMotion,
  });

  // Reduced motion gets the finished artefact, not a countdown to it.
  const settled = reducedMotion || isDone;
  const revealed = (at: number) => settled || stepIndex >= at;
  const typedName = useTypewriter(direction.name, !reducedMotion && inView, 70);

  const selectDirection = (index: number) => {
    if (index === directionIndex) return;
    setDirectionIndex(index);
    if (!reducedMotion) restart();
  };

  const [ink, surface, mid, accent] = [
    direction.palette[0]!.hex,
    direction.palette[1]!.hex,
    direction.palette[2]!.hex,
    direction.palette[3]!.hex,
  ];

  return (
    <div
      ref={ref}
      className={cn(
        "overflow-hidden rounded-md border border-ink/10 bg-paper shadow-lifted",
        className
      )}
    >
      {/* chrome */}
      <div className="flex items-center gap-3 border-b border-ink/8 bg-off-white/60 px-4 py-3">
        <div className="flex items-center gap-1.5" aria-hidden>
          <span className="h-2 w-2 rounded-full bg-ink/15" />
          <span className="h-2 w-2 rounded-full bg-ink/15" />
          <span className="h-2 w-2 rounded-full bg-ink/15" />
        </div>
        <div className="ml-1 flex min-w-0 items-center gap-2 text-[0.6875rem] tracking-[0.02em] text-neutral-500">
          <span className="font-medium text-ink">veyro</span>
          <span aria-hidden>/</span>
          <span className="truncate">studio</span>
          <span aria-hidden className="hidden sm:inline">
            /
          </span>
          <span className="hidden truncate sm:inline">{direction.segment.toLowerCase()}</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              settled ? "bg-accent-dim" : "bg-accent motion-safe:animate-pulse"
            )}
            aria-hidden
          />
          <span className="text-[0.6875rem] font-medium tabular-nums text-neutral-500">
            {settled ? "Pronto" : `${Math.round(progress * 100)}%`}
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        {/* briefing */}
        <div className="border-b border-ink/8 p-5 md:border-b-0 md:border-r md:p-6">
          <p className="text-[0.625rem] font-medium uppercase tracking-[0.12em] text-neutral-400">
            Briefing
          </p>

          <dl className="mt-4 space-y-0">
            <Row label="Nome">
              <span className="font-medium text-ink">
                {typedName}
                {!reducedMotion && typedName.length < direction.name.length && (
                  <span className="ml-px inline-block h-[1em] w-px translate-y-[0.15em] bg-ink motion-safe:animate-pulse" />
                )}
              </span>
            </Row>
            <Row label="Segmento">{direction.segment}</Row>
            <Row label="Arquitetura">Marca única</Row>
          </dl>

          <p className="mt-5 text-[0.625rem] font-medium uppercase tracking-[0.12em] text-neutral-400">
            Atributos
          </p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {direction.keywords.map((keyword, i) => (
              <motion.span
                key={`${direction.id}-${keyword}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE_EDITORIAL, delay: 0.08 * i }}
                className="rounded-full border border-ink/12 px-2.5 py-1 text-[0.6875rem] text-neutral-600"
              >
                {keyword}
              </motion.span>
            ))}
          </div>

          {/* step log */}
          <ul className="mt-6 hidden space-y-2 border-t border-ink/8 pt-4 md:block">
            {STEPS.map((step, index) => {
              const done = settled || stepIndex > index;
              const running = !settled && stepIndex === index;
              return (
                <li
                  key={step.id}
                  className={cn(
                    "flex items-center gap-2.5 text-[0.75rem] transition-colors duration-500",
                    done ? "text-neutral-500" : running ? "text-ink" : "text-neutral-300"
                  )}
                >
                  <span
                    className={cn(
                      "h-[5px] w-[5px] shrink-0 rounded-full transition-colors duration-500",
                      done ? "bg-neutral-300" : running ? "bg-accent" : "bg-ink/10"
                    )}
                    aria-hidden
                  />
                  {step.label}
                </li>
              );
            })}
          </ul>

          <div className="mt-5 h-px w-full overflow-hidden bg-ink/8 md:mt-6">
            <motion.div
              className="h-full origin-left bg-ink"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: settled ? 1 : progress }}
              transition={{ duration: 0.6, ease: EASE_EDITORIAL }}
            />
          </div>
          <p className="mt-2 text-[0.6875rem] text-neutral-400 md:hidden">
            {settled ? "Identidade gerada" : (currentStep?.label ?? "Iniciando")}
          </p>
        </div>

        {/* canvas */}
        <div
          className="relative min-h-[300px] p-5 md:min-h-[360px] md:p-7"
          style={{ backgroundColor: surface }}
          data-cursor="canvas"
          data-cursor-label="Identidade ao vivo"
        >
          <div className="flex h-full flex-col gap-5">
            {/* logo lockup */}
            <Module revealed={revealed(REVEAL_AT.logo)} label="Logotipo" ink={ink}>
              <div className="flex items-center gap-3">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={direction.id}
                    initial={{ opacity: 0, scale: 0.86 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ duration: 0.5, ease: EASE_EDITORIAL }}
                    className="flex"
                  >
                    <VMark variant={direction.markVariant} size={34} tone="current" />
                  </motion.span>
                </AnimatePresence>
                <span className="text-[1.75rem] font-semibold lowercase leading-none tracking-[-0.04em]">
                  {direction.name}
                </span>
              </div>
              <p className="mt-3 max-w-[28ch] text-[0.75rem] leading-relaxed opacity-60">
                {direction.statement}
              </p>
            </Module>

            <div className="grid flex-1 gap-4 sm:grid-cols-2">
              {/* palette */}
              <Module revealed={revealed(REVEAL_AT.palette)} label="Paleta" ink={ink}>
                <div className="mt-1 flex gap-1.5">
                  {direction.palette.map((color) => (
                    <div key={color.hex} className="group/swatch flex-1">
                      <div
                        className="h-10 w-full rounded-[3px] ring-1 ring-inset ring-black/5 transition-transform duration-300 ease-editorial group-hover/swatch:-translate-y-1"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="mt-1.5 block truncate text-[0.5625rem] uppercase tracking-[0.06em] opacity-0 transition-opacity duration-300 group-hover/swatch:opacity-60">
                        {color.hex}
                      </span>
                    </div>
                  ))}
                </div>
              </Module>

              {/* typography */}
              <Module revealed={revealed(REVEAL_AT.type)} label="Tipografia" ink={ink}>
                <div className="flex items-end justify-between gap-3">
                  <span className="text-[2.25rem] font-medium leading-none tracking-[-0.04em]">
                    Aa
                  </span>
                  <div className="pb-1 text-right text-[0.625rem] leading-relaxed opacity-60">
                    <p>{direction.typography.display}</p>
                    <p>{direction.typography.body}</p>
                  </div>
                </div>
              </Module>
            </div>

            {/* applications */}
            <Module revealed={revealed(REVEAL_AT.applications)} label="Aplicações" ink={ink}>
              <div className="mt-1 grid grid-cols-4 gap-1.5">
                <Tile bg={ink}>
                  <span style={{ color: surface }} className="flex">
                    <VMark variant="mono" size={14} tone="current" />
                  </span>
                </Tile>
                <Tile bg={mid}>
                  <span className="text-[0.5rem] font-semibold lowercase tracking-[-0.02em]" style={{ color: surface }}>
                    {direction.name}
                  </span>
                </Tile>
                <Tile bg={accent}>
                  <span style={{ color: ink }} className="flex">
                    <VMark variant="outline" size={14} tone="current" />
                  </span>
                </Tile>
                <Tile bg="transparent" className="ring-1 ring-inset ring-black/10">
                  <div className="flex w-full flex-col gap-[3px] px-2">
                    <span className="h-[2px] w-full rounded-full bg-current opacity-25" />
                    <span className="h-[2px] w-2/3 rounded-full bg-current opacity-25" />
                    <span className="h-[2px] w-4/5 rounded-full bg-current opacity-25" />
                  </div>
                </Tile>
              </div>
            </Module>
          </div>
        </div>
      </div>

      {/* direction switcher */}
      <div className="flex items-stretch border-t border-ink/8 bg-off-white/60">
        {BRAND_DIRECTIONS.map((option, index) => (
          <DirectionTab
            key={option.id}
            option={option}
            index={index}
            active={index === directionIndex}
            onSelect={() => selectDirection(index)}
          />
        ))}
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-ink/6 py-2.5 last:border-0">
      <dt className="text-[0.75rem] text-neutral-400">{label}</dt>
      <dd className="truncate text-[0.8125rem] text-neutral-700">{children}</dd>
    </div>
  );
}

/**
 * A canvas module fades and lifts into place once the step that produces it
 * has run. It is laid out at full size from the start, so nothing on the
 * canvas reflows while the identity assembles.
 */
function Module({
  label,
  revealed,
  ink,
  children,
}: {
  label: string;
  revealed: boolean;
  ink: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={false}
      animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : 10 }}
      transition={{ duration: 0.7, ease: EASE_EDITORIAL }}
      className="rounded-[6px] p-3.5 ring-1 ring-inset ring-black/[0.06]"
      style={{ color: ink, backgroundColor: "rgba(255,255,255,0.35)" }}
    >
      <p className="text-[0.5625rem] font-medium uppercase tracking-[0.14em] opacity-40">{label}</p>
      <div className="mt-2">{children}</div>
    </motion.div>
  );
}

function Tile({
  bg,
  className,
  children,
}: {
  bg: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn("flex aspect-[4/3] items-center justify-center rounded-[3px]", className)}
      style={{ backgroundColor: bg }}
    >
      {children}
    </div>
  );
}

function DirectionTab({
  option,
  index,
  active,
  onSelect,
}: {
  option: BrandDirection;
  index: number;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={cn(
        "group relative flex flex-1 items-center gap-2.5 px-4 py-3 text-left transition-colors duration-300",
        active ? "text-ink" : "text-neutral-400 hover:text-neutral-600"
      )}
    >
      <span className="text-[0.625rem] font-medium tabular-nums opacity-60">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="truncate text-[0.75rem] font-medium lowercase tracking-[-0.01em]">
        {option.name}
      </span>
      <span className="ml-auto hidden gap-1 sm:flex" aria-hidden>
        {option.palette.slice(0, 3).map((color) => (
          <span
            key={color.hex}
            className="h-2.5 w-2.5 rounded-full ring-1 ring-inset ring-black/10"
            style={{ backgroundColor: color.hex }}
          />
        ))}
      </span>
      <span
        aria-hidden
        className={cn(
          "absolute inset-x-0 top-0 h-px origin-left bg-ink transition-transform duration-500 ease-editorial",
          active ? "scale-x-100" : "scale-x-0"
        )}
      />
    </button>
  );
}

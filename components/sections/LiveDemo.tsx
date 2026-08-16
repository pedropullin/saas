"use client";

import { useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { VMark } from "@/components/ui/VMark";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useGenerationSequence } from "@/hooks/useGenerationSequence";
import { GENERATION_STEPS, demoBriefing } from "@/lib/mock/demo-sequence";
import { cn } from "@/lib/utils";
import { EASE_EDITORIAL } from "@/lib/motion/easing";

const MODULES: { id: string; label: string; revealAt: number }[] = [
  { id: "palette", label: "Paleta", revealAt: 2 },
  { id: "typography", label: "Tipografia", revealAt: 3 },
  { id: "symbol", label: "Símbolo", revealAt: 4 },
  { id: "logo", label: "Logo", revealAt: 4 },
  { id: "grid", label: "Grid", revealAt: 5 },
  { id: "applications", label: "Aplicações", revealAt: 5 },
];

const NORTE_COLORS = ["#17170F", "#F5F4EF", "#A8A79B", "#C6F13A"];

export function LiveDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  const { stepIndex, currentStep, progress, isDone, restart } = useGenerationSequence(
    GENERATION_STEPS,
    { autoStart: inView }
  );

  const isRevealed = (revealAt: number) => isDone || stepIndex > revealAt;

  return (
    <section className="border-y border-ink/8 bg-off-white py-28 md:py-36" ref={ref}>
      <Container>
        <Reveal>
          <SectionHeading eyebrow="Em ação" title="Veja a VEYRO criando uma marca." />
        </Reveal>

        <div className="mt-16 grid gap-6 lg:grid-cols-2 lg:gap-8">
          {/* Briefing side */}
          <Reveal delay={0.1}>
            <div className="h-full rounded-md border border-ink/8 bg-paper p-8">
              <p className="text-label font-medium uppercase tracking-[0.08em] text-neutral-500">
                Briefing recebido
              </p>
              <div className="mt-6 space-y-5">
                <Field label="Nome da marca" value={demoBriefing.brandName} />
                <Field label="Segmento" value={demoBriefing.segment} />
                <Field label="Arquitetura" value={demoBriefing.architecture} />
                <div>
                  <p className="text-[0.75rem] text-neutral-500">Personalidade</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {demoBriefing.personality.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-ink/12 px-3 py-1 text-[0.75rem] font-medium text-ink"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Live construction side */}
          <Reveal delay={0.18}>
            <div className="flex h-full flex-col rounded-md border border-ink/8 bg-ink p-8 text-off-white">
              <div className="flex items-center justify-between">
                <p className="text-label font-medium uppercase tracking-[0.08em] text-off-white/40">
                  Construção em tempo real
                </p>
                {isDone && (
                  <button
                    type="button"
                    onClick={restart}
                    className="text-[0.75rem] font-medium text-accent transition-opacity hover:opacity-70"
                  >
                    Reiniciar
                  </button>
                )}
              </div>

              <div className="mt-6 flex items-center gap-4">
                <VMark variant="solid" size={36} tone="paper" progress={progress} />
                <div className="flex-1">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={currentStep?.id ?? "idle"}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.3, ease: EASE_EDITORIAL }}
                      className="text-[0.875rem] font-medium"
                    >
                      {isDone ? "Sistema de marca finalizado" : currentStep?.label ?? "Aguardando..."}
                    </motion.p>
                  </AnimatePresence>
                  <ProgressBar progress={progress} className="mt-2 bg-off-white/10" />
                </div>
              </div>

              <div className="mt-7 grid flex-1 grid-cols-3 gap-2.5">
                {MODULES.map((module) => (
                  <div
                    key={module.id}
                    className={cn(
                      "flex min-h-[86px] flex-col justify-between rounded-[6px] border border-off-white/10 p-3 transition-opacity duration-500",
                      isRevealed(module.revealAt) ? "opacity-100" : "opacity-20"
                    )}
                  >
                    <span className="text-[0.6875rem] uppercase tracking-[0.06em] text-off-white/40">
                      {module.label}
                    </span>
                    {module.id === "palette" && isRevealed(module.revealAt) && (
                      <div className="flex gap-1">
                        {NORTE_COLORS.map((hex) => (
                          <span
                            key={hex}
                            className="h-4 w-4 rounded-[2px]"
                            style={{ backgroundColor: hex }}
                          />
                        ))}
                      </div>
                    )}
                    {module.id === "symbol" && isRevealed(module.revealAt) && (
                      <VMark variant="cropped" size={22} tone="paper" />
                    )}
                    {module.id === "logo" && isRevealed(module.revealAt) && (
                      <span className="text-sm font-semibold lowercase tracking-[-0.02em]">
                        norte
                      </span>
                    )}
                    {module.id === "typography" && isRevealed(module.revealAt) && (
                      <span className="text-lg font-medium">Aa</span>
                    )}
                    {(module.id === "grid" || module.id === "applications") &&
                      isRevealed(module.revealAt) && (
                        <div className="grid grid-cols-3 gap-0.5">
                          {Array.from({ length: 6 }).map((_, i) => (
                            <span key={i} className="h-2 rounded-[1px] bg-off-white/25" />
                          ))}
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-ink/6 pb-3">
      <span className="text-[0.8125rem] text-neutral-500">{label}</span>
      <span className="text-[0.9375rem] font-medium text-ink">{value}</span>
    </div>
  );
}

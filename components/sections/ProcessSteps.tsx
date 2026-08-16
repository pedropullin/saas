"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { VMark } from "@/components/ui/VMark";
import { cn } from "@/lib/utils";
import { EASE_EDITORIAL } from "@/lib/motion/easing";
import type { VMarkVariant } from "@/lib/types";

const STEPS: { number: string; title: string; description: string; variant: VMarkVariant }[] = [
  {
    number: "01",
    title: "Briefing",
    description: "Você responde perguntas simples sobre nome, segmento e percepção desejada.",
    variant: "solid",
  },
  {
    number: "02",
    title: "Direção",
    description: "A VEYRO explora direções visuais coerentes com o briefing recebido.",
    variant: "split",
  },
  {
    number: "03",
    title: "Identidade",
    description: "Logotipo, símbolo, paleta e tipografia tomam forma como um sistema único.",
    variant: "cropped",
  },
  {
    number: "04",
    title: "Aplicações",
    description: "O sistema é validado em aplicações reais, físicas e digitais.",
    variant: "stacked",
  },
  {
    number: "05",
    title: "Brand Book",
    description: "Tudo documentado em diretrizes claras, prontas para orientar qualquer equipe.",
    variant: "mono",
  },
];

export function ProcessSteps() {
  const [active, setActive] = useState(0);
  const step = STEPS[active] ?? STEPS[0]!;

  return (
    <section id="como-funciona" className="py-28 md:py-36">
      <Container>
        <Reveal>
          <SectionHeading eyebrow="O processo" title="Do briefing à marca." />
        </Reveal>

        <div className="mt-16 grid gap-4 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <Reveal delay={0.1} className="order-2 lg:order-1">
            <ol className="divide-y divide-ink/8 border-y border-ink/8">
              {STEPS.map((item, index) => (
                <li key={item.number}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(index)}
                    onFocus={() => setActive(index)}
                    onClick={() => setActive(index)}
                    className="flex w-full items-start gap-6 py-6 text-left"
                    aria-pressed={active === index}
                  >
                    <span
                      className={cn(
                        "text-[0.8125rem] font-medium tabular-nums transition-colors duration-300",
                        active === index ? "text-accent-dim" : "text-neutral-400"
                      )}
                    >
                      {item.number}
                    </span>
                    <div>
                      <p
                        className={cn(
                          "text-h3 font-medium transition-colors duration-300",
                          active === index ? "text-ink" : "text-neutral-400"
                        )}
                      >
                        {item.title}
                      </p>
                      <AnimatePresence>
                        {active === index && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: EASE_EDITORIAL }}
                            className="mt-2 max-w-md text-[0.9375rem] text-neutral-600"
                          >
                            {item.description}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </button>
                </li>
              ))}
            </ol>
          </Reveal>

          <Reveal delay={0.15} className="order-1 lg:order-2">
            <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-md border border-ink/8 bg-off-white">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.45, ease: EASE_EDITORIAL }}
                  className="flex flex-col items-center gap-6"
                >
                  <VMark variant={step.variant} size={140} tone="ink" />
                  <span className="text-label font-medium uppercase tracking-[0.08em] text-neutral-500">
                    {step.number} — {step.title}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

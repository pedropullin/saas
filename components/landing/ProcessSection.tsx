"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { RevealLines } from "@/components/landing/TextReveal";
import { PROCESS_STEPS } from "@/lib/mock/landing";
import { EASE_EDITORIAL } from "@/lib/motion/easing";

/**
 * Section 6 — the commercial process as an editorial index.
 *
 * Four rows, one rule that fills with scroll. The only hover state is a small
 * lateral shift, which is enough to say "this is a row" without turning the
 * list into a control panel.
 */
export function ProcessSection() {
  const listRef = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start 80%", "end 90%"],
  });
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });

  return (
    <section id="how-it-works" className="scroll-mt-24 border-b border-ink/8 py-24 md:py-36">
      <Container>
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <p className="text-label font-medium uppercase tracking-[0.14em] text-neutral-500">
              Como funciona
            </p>
            <RevealLines
              as="h2"
              className="mt-5 text-h1 font-medium text-ink"
              lines={["Quatro etapas", "até a marca final."]}
            />
          </div>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-12% 0px" }}
            transition={{ duration: 0.8, ease: EASE_EDITORIAL, delay: 0.1 }}
            className="max-w-sm text-[0.9375rem] leading-relaxed text-neutral-600 lg:text-right"
          >
            Você entra em qualquer etapa e sai com um sistema pronto para uso. O refinamento humano é
            opcional — não obrigatório.
          </motion.p>
        </div>

        <div className="relative mt-14 md:mt-20">
          <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-ink/10" />
          <motion.div
            aria-hidden
            style={{ scaleX }}
            className="absolute inset-x-0 top-0 h-px origin-left bg-ink"
          />

          <ol ref={listRef}>
            {PROCESS_STEPS.map((step, index) => (
              <motion.li
                key={step.index}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-14% 0px" }}
                transition={{ duration: 0.85, ease: EASE_EDITORIAL, delay: index * 0.05 }}
                className="group border-b border-ink/10"
              >
                <div className="grid grid-cols-1 gap-3 py-8 transition-transform duration-500 ease-editorial group-hover:translate-x-1.5 lg:grid-cols-[auto_minmax(0,1fr)_minmax(0,1.1fr)_auto] lg:items-baseline lg:gap-10 lg:py-10">
                  <span className="text-[2.5rem] font-medium leading-none tracking-[-0.04em] text-neutral-200 tabular-nums transition-colors duration-500 group-hover:text-ink md:text-[3.5rem]">
                    {step.index}
                  </span>

                  <div>
                    <h3 className="text-h3 font-medium text-ink">{step.title}</h3>
                    <p className="mt-1 text-[0.875rem] text-neutral-500">{step.lead}</p>
                  </div>

                  <p className="max-w-xl text-[0.9375rem] leading-relaxed text-neutral-600">
                    {step.description}
                  </p>

                  <span className="whitespace-nowrap text-[0.75rem] uppercase tracking-[0.08em] text-neutral-400">
                    {step.detail}
                  </span>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}

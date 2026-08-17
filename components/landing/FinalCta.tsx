"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useSafeReducedMotion } from "@/hooks/useSafeReducedMotion";
import { Container } from "@/components/ui/Container";
import { VMark } from "@/components/ui/VMark";
import { CTAButton } from "@/components/landing/CTAButton";
import { RevealLines } from "@/components/landing/TextReveal";
import { Parallax } from "@/components/landing/Parallax";
import { EASE_EDITORIAL } from "@/lib/motion/easing";

/** Section 7 — the close. One statement, one action. */
export function FinalCta() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useSafeReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  // Springing the read keeps the parallax on framer's JS path — see Hero.
  const progress = useSpring(scrollYProgress, { stiffness: 130, damping: 34, mass: 0.5 });
  const markY = useTransform(progress, [0, 1], [70, -70]);

  return (
    <section
      ref={sectionRef}
      data-nav-theme="dark"
      className="relative overflow-hidden bg-ink py-28 text-off-white md:py-40"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="blueprint-grid-invert mask-radial-fade absolute inset-0" />
        <motion.div
          style={reducedMotion ? undefined : { y: markY }}
          className="absolute -bottom-24 -right-16 hidden md:block"
        >
          <Parallax strength={20}>
            <VMark variant="stacked" size={520} tone="paper" className="opacity-[0.045]" />
          </Parallax>
        </motion.div>
      </div>

      <Container className="relative">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE_EDITORIAL }}
            className="flex items-start gap-2.5"
          >
            <span className="mt-[0.4rem] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
            <p className="text-label font-medium uppercase tracking-[0.14em] text-off-white/40">
              Comece agora
            </p>
          </motion.div>

          <RevealLines
            as="h2"
            className="mt-7 text-hero font-medium"
            lines={[
              "Your brand",
              <>
                starts here<span className="text-accent">.</span>
              </>,
            ]}
          />

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.9, ease: EASE_EDITORIAL, delay: 0.25 }}
            className="mt-8 max-w-lg text-body-lg leading-relaxed text-off-white/60 text-pretty"
          >
            Responda seis perguntas e veja a primeira versão da sua identidade em minutos. Refine
            com a IA ou chame um designer quando quiser.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.9, ease: EASE_EDITORIAL, delay: 0.35 }}
            className="mt-11 flex flex-wrap items-center gap-4"
          >
            <CTAButton
              href="/app/criar"
              size="lg"
              variant="invert"
              data-cursor="cta"
              data-cursor-label="Criar"
            >
              Create with VEYRO
            </CTAButton>
            <CTAButton
              href="#designers"
              size="lg"
              variant="quiet"
              arrow={false}
              magnetic={false}
            >
              Falar com a rede
            </CTAButton>
            <span className="text-[0.8125rem] text-off-white/35">
              Sem cartão de crédito
            </span>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}

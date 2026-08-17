"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useSafeReducedMotion } from "@/hooks/useSafeReducedMotion";
import { Container } from "@/components/ui/Container";
import { VMark } from "@/components/ui/VMark";
import { CTAButton } from "@/components/landing/CTAButton";
import { RevealLines } from "@/components/landing/TextReveal";
import { Parallax } from "@/components/landing/Parallax";
import { BrandGeneratorPreview } from "@/components/landing/BrandGeneratorPreview";
import { EASE_EDITORIAL } from "@/lib/motion/easing";

export function Hero() {
  const windowRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useSafeReducedMotion();

  // The product window starts slightly laid back and flattens as it rises
  // into the viewport — one scroll-linked transform, no scroll listener.
  const { scrollYProgress } = useScroll({
    target: windowRef,
    offset: ["start 0.95", "start 0.3"],
  });
  // Smoothed, and deliberately not the raw scroll value: a raw one wired into
  // `style` is handed off to a native scroll timeline whose range does not
  // match this element's, which puts the tilt out of sync with the scroll.
  const progress = useSpring(scrollYProgress, { stiffness: 150, damping: 34, mass: 0.4 });
  const rotateX = useTransform(progress, [0, 1], [9, 0]);
  const scale = useTransform(progress, [0, 1], [0.965, 1]);
  const lift = useTransform(progress, [0, 1], [28, 0]);

  return (
    <section className="relative pt-28 md:pt-32">
      {/* drafting grid + oversized mark, both cursor-reactive */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="blueprint-grid mask-radial-fade absolute inset-0" />
        <Parallax strength={18} className="absolute -right-[12%] -top-[18%] hidden lg:block">
          <VMark variant="split" size={720} tone="ink" className="opacity-[0.028]" />
        </Parallax>
      </div>

      <Container className="relative flex min-h-[72vh] flex-col justify-center py-14 md:py-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, ease: EASE_EDITORIAL }}
          className="flex items-start gap-2.5"
        >
          <span className="mt-[0.4rem] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
          <p className="text-label font-medium uppercase tracking-[0.14em] text-neutral-500">
            Branding profissional, simplificado pela IA
          </p>
        </motion.div>

        <RevealLines
          as="h1"
          immediate
          delay={0.12}
          className="mt-7 text-hero font-medium text-ink"
          lines={[
            "Build your",
            <>
              identity<span className="text-accent-dim">.</span>
            </>,
          ]}
        />

        <div className="mt-9 grid gap-10 md:mt-11 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-16">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE_EDITORIAL, delay: 0.45 }}
            className="max-w-xl text-body-lg text-neutral-600 text-pretty"
          >
            Crie uma identidade visual completa com inteligência artificial e refine o resultado com
            designers profissionais.
          </motion.p>

          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, ease: EASE_EDITORIAL, delay: 0.6 }}
            className="flex gap-8 border-t border-ink/8 pt-5 lg:border-0 lg:pt-0"
          >
            {[
              { value: "~4 min", label: "Primeira versão" },
              { value: "38", label: "Designers na rede" },
              { value: "12k+", label: "Marcas criadas" },
            ].map((stat) => (
              <div key={stat.label}>
                <dt className="text-[1.375rem] font-medium tracking-[-0.03em] text-ink tabular-nums">
                  {stat.value}
                </dt>
                <dd className="mt-0.5 text-[0.75rem] text-neutral-500">{stat.label}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE_EDITORIAL, delay: 0.55 }}
          className="mt-10 flex flex-wrap items-center gap-3 md:mt-12"
        >
          <CTAButton
            href="/app/criar"
            size="lg"
            data-cursor="cta"
            data-cursor-label="Começar"
          >
            Criar minha identidade
          </CTAButton>
          <CTAButton href="#how-it-works" size="lg" variant="secondary" arrow={false} magnetic={false}>
            Ver como funciona
          </CTAButton>
        </motion.div>
      </Container>

      {/* live product */}
      <Container className="relative pb-24 md:pb-32">
        <div ref={windowRef} className="perspective-1200">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: EASE_EDITORIAL, delay: 0.35 }}
            style={reducedMotion ? undefined : { rotateX, scale, y: lift }}
            className="origin-top will-change-transform"
          >
            <BrandGeneratorPreview />
          </motion.div>
        </div>

        {/* annotation chips — depth, and a hint at what the canvas is doing */}
        <Parallax
          strength={10}
          className="pointer-events-none absolute -left-2 top-[22%] hidden xl:block"
        >
          <Chip>Sistema coerente desde a primeira versão</Chip>
        </Parallax>
        <Parallax
          strength={16}
          className="pointer-events-none absolute -right-4 bottom-[26%] hidden xl:block"
        >
          <Chip>Refinamento humano opcional</Chip>
        </Parallax>
      </Container>
    </section>
  );
}

function Chip({ children }: { children: string }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: EASE_EDITORIAL, delay: 1.1 }}
      className="block max-w-[13rem] rounded-xs border border-ink/8 bg-paper/80 px-3 py-2 text-[0.6875rem] leading-relaxed text-neutral-500 shadow-subtle backdrop-blur-sm"
    >
      {children}
    </motion.span>
  );
}

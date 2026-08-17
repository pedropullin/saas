"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown } from "@phosphor-icons/react";
import { PlaceholderImage } from "@/components/afago/PlaceholderImage";
import { TextReveal } from "@/components/afago/TextReveal";
import { AfagoButton } from "@/components/afago/AfagoButton";
import { EASE_EDITORIAL } from "@/lib/motion/easing";

const EMBERS = [
  { left: "12%", size: 3, delay: 0 },
  { left: "24%", size: 2, delay: 1.4 },
  { left: "38%", size: 4, delay: 0.6 },
  { left: "58%", size: 2, delay: 2.1 },
  { left: "71%", size: 3, delay: 0.9 },
  { left: "85%", size: 2, delay: 1.8 },
];

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.18]);
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [0.35, 0.85]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section id="inicio" ref={ref} className="relative h-[100svh] min-h-[640px] overflow-hidden bg-afago-void">
      <motion.div
        className="absolute inset-0"
        style={{ scale: imageScale, y: imageY }}
        initial={{ clipPath: "inset(8% 8% 8% 8% round 28px)", filter: "blur(22px)", opacity: 0 }}
        animate={{ clipPath: "inset(0% 0% 0% 0% round 0px)", filter: "blur(0px)", opacity: 1 }}
        transition={{ duration: 1.9, ease: EASE_EDITORIAL }}
      >
        <PlaceholderImage
          label="Hero — prato-assinatura ou salão do Afago, plano cinematográfico"
          tone="terracotta"
          className="h-full w-full"
        />
      </motion.div>

      {/* Cinematic vignette + scroll-linked darkening so the type stays legible throughout the pin. */}
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-afago-void via-afago-void/30 to-afago-void/50"
        style={{ opacity: overlayOpacity }}
      />
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_100%,transparent_20%,#0b0908_92%)]" />

      {/* Sparse embers drifting upward — decorative only, cheap (6 nodes, transform+opacity). */}
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden sm:block">
        {EMBERS.map((ember, i) => (
          <motion.span
            key={i}
            className="absolute bottom-0 rounded-full bg-afago-gold-soft"
            style={{ left: ember.left, width: ember.size, height: ember.size }}
            animate={{ y: ["0%", "-115%"], opacity: [0, 0.8, 0] }}
            transition={{
              duration: 7 + i,
              repeat: Infinity,
              ease: "easeOut",
              delay: ember.delay,
            }}
          />
        ))}
      </div>

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center"
      >
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE_EDITORIAL, delay: 0.6 }}
          className="mb-5 text-[0.7rem] font-medium uppercase tracking-[0.32em] text-afago-gold-soft"
        >
          Curitiba · Atuba
        </motion.p>

        <h1 className="font-serif text-afago-display leading-none text-afago-cream">
          {"AFAGO".split("").map((letter, i) => (
            <motion.span
              key={i}
              className="inline-block"
              initial={{ y: "115%", rotate: 4 }}
              animate={{ y: "0%", rotate: 0 }}
              transition={{ duration: 1, ease: EASE_EDITORIAL, delay: 0.5 + i * 0.06 }}
            >
              {letter}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, ease: EASE_EDITORIAL, delay: 1.3 }}
          className="mt-4 font-serif text-xl italic text-afago-cream-dim sm:text-2xl"
        >
          Restaurante &amp; Petiscaria
        </motion.p>

        <TextReveal
          as="p"
          text="“Sabores para compartilhar. Momentos para ficar.”"
          delay={1.7}
          className="mx-auto mt-6 max-w-md justify-center text-balance text-sm text-afago-cream/70 sm:text-base"
        />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE_EDITORIAL, delay: 2.1 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <AfagoButton href="#cardapio" variant="solid">
            Ver Cardápio
          </AfagoButton>
          <AfagoButton href="#sobre" variant="outline">
            Conhecer o Afago
          </AfagoButton>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2.6 }}
        className="absolute inset-x-0 bottom-8 z-10 flex flex-col items-center gap-2"
      >
        <span className="text-[0.65rem] uppercase tracking-[0.3em] text-afago-cream/50">Role</span>
        <motion.span
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown size={16} className="text-afago-cream/50" />
        </motion.span>
      </motion.div>
    </section>
  );
}

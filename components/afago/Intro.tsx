"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { TextReveal } from "@/components/afago/TextReveal";
import { PlaceholderImage } from "@/components/afago/PlaceholderImage";
import { EASE_EDITORIAL } from "@/lib/motion/easing";

export function Intro() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  const imageY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const imageScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.08, 1, 1.08]);
  const detailClip = useTransform(scrollYProgress, [0.3, 0.75], [0, 100]);
  const detailClipPath = useTransform(detailClip, (v) => `circle(${v}% at 50% 50%)`);

  return (
    <section id="sobre" ref={ref} className="relative bg-afago-char py-28 sm:py-36">
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-14 px-6 md:px-10 lg:grid-cols-2 lg:items-center lg:gap-10">
        <div className="order-2 lg:order-1">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.32em] text-afago-terracotta-soft">
            O Afago
          </p>

          <TextReveal
            as="h2"
            text="Um lugar para comer bem."
            highlight={["comer", "bem."]}
            className="mt-5 font-serif text-afago-h2 leading-[1.05] text-afago-cream"
          />
          <TextReveal
            as="h2"
            text="Um lugar para ficar."
            highlight={["ficar."]}
            delay={0.15}
            className="mt-1 font-serif text-afago-h2 leading-[1.05] text-afago-cream"
          />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 0.8, ease: EASE_EDITORIAL, delay: 0.5 }}
            className="mt-8 max-w-md text-[0.95rem] leading-relaxed text-afago-cream-dim/80"
          >
            No bairro Atuba, o Afago reúne petiscos, pratos da casa e boa companhia
            à mesa — o tipo de lugar que se visita para comer bem e acaba ficando
            pela conversa.
          </motion.p>
        </div>

        <div className="order-1 lg:order-2">
          <motion.div className="relative aspect-[4/5] w-full" style={{ scale: imageScale }}>
            <motion.div className="absolute inset-0" style={{ y: imageY }}>
              <PlaceholderImage
                label="Ambiente — salão / mesas do Afago"
                tone="char"
                className="h-full w-full rounded-sm"
              />
            </motion.div>

            {/* Detail reveal: a second, tighter crop unmasked via a growing circle as the section scrolls. */}
            <motion.div
              className="absolute -bottom-8 -left-8 h-40 w-40 overflow-hidden rounded-full border border-afago-line shadow-[0_20px_60px_rgba(0,0,0,0.45)] sm:h-52 sm:w-52"
              style={{ clipPath: detailClipPath }}
            >
              <PlaceholderImage
                label="Detalhe — prato ou textura de madeira/brasa"
                tone="terracotta"
                showCaption={false}
                className="h-full w-full"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

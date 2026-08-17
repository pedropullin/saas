"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { VMark } from "@/components/ui/VMark";

export function FinalCta() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const markY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-ink py-32 text-off-white md:py-44">
      <Container className="relative text-center">
        <Reveal>
          <h2 className="text-display font-medium text-off-white text-balance">
            Sua próxima marca começa aqui.
          </h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mx-auto mt-6 max-w-md text-body-lg text-off-white/60">
            Responda algumas perguntas. A VEYRO faz o resto.
          </p>
        </Reveal>
        <Reveal delay={0.22} className="mt-10">
          <Button href="/app/criar" size="lg" magnetic>
            Criar minha identidade
          </Button>
        </Reveal>
      </Container>

      <Reveal delay={0.3} className="mt-24 flex justify-center">
        <motion.div style={{ y: markY }}>
          <VMark variant="cropped" size={220} tone="paper" breathe />
        </motion.div>
      </Reveal>
    </section>
  );
}

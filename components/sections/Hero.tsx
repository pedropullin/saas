"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { PhoneMockup } from "@/components/ui/PhoneMockup";
import { VMark } from "@/components/ui/VMark";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import { EASE_EDITORIAL } from "@/lib/motion/easing";

export function Hero() {
  const { ref, activeStep } = useScrollProgress(5);

  return (
    <section ref={ref} className="relative" style={{ height: "220vh" }}>
      <div className="sticky top-0 flex min-h-screen items-center overflow-hidden pt-24">
        <VMark
          variant="split"
          size={640}
          tone="ink"
          className="pointer-events-none absolute -right-40 -top-40 opacity-[0.03]"
        />
        <Container className="grid items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE_EDITORIAL }}
          >
            <p className="mb-6 text-label font-medium uppercase tracking-[0.08em] text-neutral-500">
              Identidade de marca com inteligência
            </p>
            <h1 className="text-display font-medium text-ink text-balance">
              Crie marcas extraordinárias com inteligência.
            </h1>
            <p className="mt-7 max-w-lg text-body-lg text-neutral-600 text-pretty">
              Da ideia ao sistema visual completo. A VEYRO transforma um briefing simples em uma
              identidade de marca pronta para crescer.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Button href="/app/criar" size="lg" data-cursor="view" data-cursor-label="Criar">
                Criar minha marca
              </Button>
              <Button href="#como-funciona" size="lg" variant="secondary">
                Explorar a VEYRO
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: EASE_EDITORIAL, delay: 0.15 }}
            className="relative"
          >
            <PhoneMockup step={activeStep} />
          </motion.div>
        </Container>
      </div>
    </section>
  );
}

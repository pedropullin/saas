"use client";

import { motion } from "framer-motion";
import { VMark } from "@/components/ui/VMark";
import { Magnetic } from "@/components/ui/Magnetic";
import { ShimmerCta } from "@/components/ui/ShimmerCta";
import { TransitionLink } from "@/components/providers/TransitionLink";
import { ClosingBar } from "./ClosingBar";

export function FinalCycle() {
  return (
    <section id="precos" className="relative flex flex-col overflow-hidden bg-ink">
      <div className="relative flex min-h-screen flex-col items-center justify-center px-6 py-32 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 0.05, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <VMark variant="cropped" size={1100} tone="paper" />
        </motion.div>

        <motion.span
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative text-label font-medium uppercase tracking-[0.16em] text-off-white/40"
        >
          Sem cartão de crédito · comece grátis
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
          className="relative mt-6 text-[14vw] font-semibold leading-[0.94] tracking-[-0.04em] text-off-white sm:text-[9rem]"
        >
          VEYRO
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
          className="relative mt-6 max-w-md text-body-lg text-off-white/60"
        >
          A próxima geração de criação de marcas.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative mt-1 max-w-md text-body-lg text-off-white/60"
        >
          Crie sua primeira identidade.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="relative mt-10"
        >
          <Magnetic>
            <ShimmerCta>
              <TransitionLink
                href="/app/criar"
                data-cursor="v"
                className="inline-flex items-center justify-center rounded-[3px] bg-accent px-10 py-4 text-[0.9375rem] font-medium text-accent-ink transition-transform hover:scale-[1.02]"
              >
                Começar agora
              </TransitionLink>
            </ShimmerCta>
          </Magnetic>
        </motion.div>
      </div>

      <ClosingBar />
    </section>
  );
}

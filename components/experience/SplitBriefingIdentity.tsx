"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { VMark } from "@/components/ui/VMark";
import { Container } from "@/components/ui/Container";
import { mapRange } from "@/lib/motion/mapRange";

const QA = [
  { q: "Nome da marca", a: "Vant" },
  { q: "Segmento", a: "Tecnologia financeira" },
  { q: "Personalidade", a: "Precisa, confiável, direta" },
  { q: "Público", a: "Empresas que movem dinheiro todos os dias" },
];

export function SplitBriefingIdentity() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const briefingOpacity = useTransform(scrollYProgress, (v) => mapRange(v, [0.62, 0.86], [1, 0]));
  const briefingY = useTransform(scrollYProgress, (v) => mapRange(v, [0, 1], [0, -140]));

  const chipsOpacity = useTransform(scrollYProgress, (v) => mapRange(v, [0.05, 0.22], [0, 1]));
  const chipsScale = useTransform(scrollYProgress, (v) => mapRange(v, [0.05, 0.22], [0.8, 1]));
  const logoOpacity = useTransform(scrollYProgress, (v) => mapRange(v, [0.28, 0.45], [0, 1]));
  const logoY = useTransform(scrollYProgress, (v) => mapRange(v, [0.28, 0.45], [24, 0]));
  const typeOpacity = useTransform(scrollYProgress, (v) => mapRange(v, [0.5, 0.68], [0, 1]));
  const typeY = useTransform(scrollYProgress, (v) => mapRange(v, [0.5, 0.68], [24, 0]));
  const cardOpacity = useTransform(scrollYProgress, (v) => mapRange(v, [0.72, 0.92], [0, 1]));
  const cardScale = useTransform(scrollYProgress, (v) => mapRange(v, [0.72, 1], [0.94, 1]));

  return (
    <section ref={ref} className="relative bg-off-white" style={{ height: "260vh" }}>
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <Container className="grid w-full items-center gap-4 lg:grid-cols-2">
          <motion.div style={{ opacity: briefingOpacity, y: briefingY }}>
            <p className="text-label font-medium uppercase tracking-[0.08em] text-neutral-500">Um briefing</p>
            <h2 className="mt-4 max-w-md text-h1 font-medium text-ink">
              Quatro respostas. Um sistema de marca inteiro.
            </h2>
            <dl className="mt-10 space-y-6">
              {QA.map((item) => (
                <div key={item.q} className="border-b border-ink/8 pb-4">
                  <dt className="text-[0.75rem] uppercase tracking-[0.06em] text-neutral-400">{item.q}</dt>
                  <dd className="mt-1.5 text-[1.0625rem] font-medium text-ink">{item.a}</dd>
                </div>
              ))}
            </dl>
          </motion.div>

          <div className="relative flex h-[420px] items-center justify-center">
            <motion.div style={{ opacity: chipsOpacity, scale: chipsScale }} className="absolute top-6 flex gap-2">
              {["#0A0A09", "#FFFFFF", "#86857A", "#C6F13A"].map((hex) => (
                <span
                  key={hex}
                  className="h-10 w-10 rounded-[4px] border border-ink/10"
                  style={{ backgroundColor: hex }}
                />
              ))}
            </motion.div>

            <motion.div style={{ opacity: logoOpacity, y: logoY }} className="absolute flex items-center gap-3">
              <VMark variant="split" size={56} tone="ink" />
              <span className="text-4xl font-semibold lowercase tracking-[-0.02em] text-ink">vant</span>
            </motion.div>

            <motion.p
              style={{ opacity: typeOpacity, y: typeY }}
              className="absolute bottom-24 max-w-xs text-center text-[0.9375rem] leading-relaxed text-neutral-600"
            >
              Grotesco Compacto — precisa, sem excesso, feita para números.
            </motion.p>

            <motion.div
              style={{ opacity: cardOpacity, scale: cardScale }}
              className="absolute bottom-0 w-full max-w-xs overflow-hidden rounded-md border border-ink/10 bg-ink shadow-lifted"
            >
              <div className="flex items-center gap-2.5 px-5 py-4">
                <VMark variant="split" size={18} tone="paper" />
                <span className="text-[0.9375rem] font-medium lowercase text-off-white">vant</span>
              </div>
              <div className="grid grid-cols-4">
                {["#0A0A09", "#FFFFFF", "#86857A", "#C6F13A"].map((hex) => (
                  <div key={hex} className="h-6" style={{ backgroundColor: hex }} />
                ))}
              </div>
            </motion.div>
          </div>
        </Container>
      </div>
    </section>
  );
}

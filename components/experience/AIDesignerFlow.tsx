"use client";

import { motion } from "framer-motion";
import { VMark } from "@/components/ui/VMark";
import { EASE_EDITORIAL } from "@/lib/motion/easing";
import { cn } from "@/lib/utils";

const STAGES = [
  { label: "Briefing", body: "Você conta o que a marca precisa ser." },
  { label: "IA", body: "A VEYRO gera a primeira versão completa do sistema." },
  { label: "Identidade", body: "Logo, cor, tipografia e aplicações prontos." },
  { label: "Designer", body: "Um designer real entra para refinar." },
  { label: "Refinamento", body: "Ajustes finos, decisões humanas, contexto." },
  { label: "Marca final", body: "Um sistema pronto para lançar e escalar." },
];

export function AIDesignerFlow() {
  return (
    <section id="como-funciona" className="bg-ink py-32">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <p className="text-label font-medium uppercase tracking-[0.08em] text-off-white/40">O diferencial</p>
        <h2 className="mt-4 text-h1 font-medium text-off-white">Inteligência primeiro. Pessoas depois.</h2>
        <p className="mx-auto mt-4 max-w-md text-body-lg text-off-white/55">
          A primeira versão nasce em minutos. Quando a marca precisa de uma mão humana, um designer
          da VEYRO assume o refinamento.
        </p>
      </div>

      <div className="mx-auto mt-16 flex max-w-5xl flex-wrap items-stretch justify-center gap-0 px-6">
        {STAGES.map((stage, i) => (
          <div key={stage.label} className="flex items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 0.55, delay: i * 0.08, ease: EASE_EDITORIAL }}
              className={cn(
                "flex w-40 flex-col gap-3 rounded-md border p-5",
                i === 1 ? "border-accent/60 bg-accent/[0.06]" : i === 3 ? "border-off-white/25 bg-off-white/[0.04]" : "border-off-white/10 bg-off-white/[0.02]"
              )}
            >
              <span className="text-[0.6875rem] font-medium uppercase tracking-[0.06em] text-off-white/40">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-[0.9375rem] font-medium text-off-white">{stage.label}</p>
              <p className="text-[0.75rem] leading-relaxed text-off-white/50">{stage.body}</p>
            </motion.div>
            {i < STAGES.length - 1 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.6 }}
                whileInView={{ opacity: 0.5, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 + 0.2, ease: EASE_EDITORIAL }}
                className="px-1.5"
              >
                <VMark variant="mono" size={16} tone="paper" />
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

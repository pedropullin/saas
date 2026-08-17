"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PhoneMockup } from "@/components/ui/PhoneMockup";
import { EASE_EDITORIAL } from "@/lib/motion/easing";
import { cn } from "@/lib/utils";

const STEPS = [
  { title: "Briefing", body: "Conte o nome e o segmento da sua marca." },
  { title: "Perguntas", body: "Escolha as palavras que definem a personalidade." },
  { title: "Geração", body: "A VEYRO constrói direções visuais em segundos." },
  { title: "Identidade", body: "Logo, símbolo e paleta prontos para revisão." },
  { title: "Aplicações", body: "Veja tudo aplicado antes de aprovar." },
];

export function MobileInteractive() {
  const [step, setStep] = useState(0);

  function go(delta: number) {
    setStep((s) => Math.min(STEPS.length - 1, Math.max(0, s + delta)));
  }

  const active = STEPS[step] ?? STEPS[0]!;

  return (
    <section className="bg-off-white py-32">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <p className="text-label font-medium uppercase tracking-[0.08em] text-neutral-500">No seu bolso</p>
        <h2 className="mt-4 text-h1 font-medium text-ink">O fluxo inteiro, no celular.</h2>
      </div>

      <div className="mx-auto mt-16 flex max-w-3xl flex-col items-center gap-10 px-6 md:flex-row md:items-center md:justify-center md:gap-16">
        <motion.button
          type="button"
          onClick={() => go(-1)}
          disabled={step === 0}
          aria-label="Tela anterior"
          data-cursor="v"
          className="order-2 text-[0.8125rem] font-medium text-neutral-500 transition-colors hover:text-ink disabled:opacity-30 md:order-1"
        >
          ← Anterior
        </motion.button>

        <div
          className="order-1 cursor-pointer select-none md:order-2"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const half = rect.left + rect.width / 2;
            go(e.clientX < half ? -1 : 1);
          }}
        >
          <motion.div
            key={step}
            initial={{ rotateY: 8, scale: 0.97 }}
            animate={{ rotateY: 0, scale: 1 }}
            transition={{ duration: 0.4, ease: EASE_EDITORIAL }}
            style={{ perspective: 1000 }}
          >
            <PhoneMockup step={step} />
          </motion.div>

          <div className="mt-6 flex justify-center gap-1.5">
            {STEPS.map((s, i) => (
              <button
                key={s.title}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setStep(i);
                }}
                aria-label={s.title}
                className={cn(
                  "h-1 rounded-full transition-all duration-300",
                  i === step ? "w-6 bg-accent-dim" : "w-1 bg-ink/15"
                )}
              />
            ))}
          </div>

          <motion.div key={active.title} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-5 text-center">
            <p className="text-[0.9375rem] font-medium text-ink">{active.title}</p>
            <p className="mt-1 max-w-[240px] text-[0.8125rem] text-neutral-500">{active.body}</p>
          </motion.div>
        </div>

        <button
          type="button"
          onClick={() => go(1)}
          disabled={step === STEPS.length - 1}
          aria-label="Próxima tela"
          data-cursor="v"
          className="order-3 text-[0.8125rem] font-medium text-neutral-500 transition-colors hover:text-ink disabled:opacity-30"
        >
          Próxima →
        </button>
      </div>
    </section>
  );
}

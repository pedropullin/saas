"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { RevealLines } from "@/components/landing/TextReveal";
import { VMark } from "@/components/ui/VMark";
import { FLOW_STAGES } from "@/lib/mock/landing";
import { EASE_EDITORIAL } from "@/lib/motion/easing";
import { cn } from "@/lib/utils";

/**
 * Section 2 — "Uma identidade. Em minutos."
 *
 * A sticky thesis on the left, four beats on the right. The rule between the
 * beats fills with scroll position, so the section reads as a single
 * continuous move rather than four independent reveals.
 */
export function FlowSection() {
  const listRef = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start 75%", "end 85%"],
  });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });

  return (
    <section id="product" className="relative scroll-mt-24 border-t border-ink/8 py-24 md:py-36">
      <Container className="grid gap-14 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-24">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <p className="text-label font-medium uppercase tracking-[0.14em] text-neutral-500">
            O fluxo
          </p>
          <RevealLines
            as="h2"
            className="mt-5 text-h1 font-medium text-ink"
            lines={["Uma identidade.", "Em minutos."]}
          />
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-12% 0px" }}
            transition={{ duration: 0.8, ease: EASE_EDITORIAL, delay: 0.15 }}
            className="mt-6 max-w-md text-body-lg text-neutral-600 text-pretty"
          >
            O que costuma levar semanas de idas e vindas acontece em uma sessão. Você descreve a
            marca, a VEYRO constrói o sistema e você decide até onde levar.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: EASE_EDITORIAL, delay: 0.3 }}
            className="mt-10 flex items-center gap-3 border-t border-ink/8 pt-6"
          >
            <VMark variant="cropped" size={22} tone="ink" />
            <p className="text-[0.8125rem] text-neutral-500">
              Nenhuma etapa exige conhecimento de design.
            </p>
          </motion.div>
        </div>

        <ol ref={listRef} className="relative">
          {/* track + fill */}
          <div
            aria-hidden
            className="absolute left-[7px] top-2 hidden h-[calc(100%-1rem)] w-px bg-ink/10 sm:block"
          />
          <motion.div
            aria-hidden
            style={{ scaleY }}
            className="absolute left-[7px] top-2 hidden h-[calc(100%-1rem)] w-px origin-top bg-ink sm:block"
          />

          {FLOW_STAGES.map((stage, index) => (
            <motion.li
              key={stage.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-18% 0px" }}
              transition={{ duration: 0.9, ease: EASE_EDITORIAL }}
              className="relative pb-14 last:pb-0 sm:pl-14"
            >
              <span
                aria-hidden
                className="absolute left-0 top-1.5 hidden h-[15px] w-[15px] items-center justify-center rounded-full border border-ink/15 bg-off-white sm:flex"
              >
                <span className="h-[5px] w-[5px] rounded-full bg-ink" />
              </span>

              <div className="flex items-baseline gap-4">
                <span className="text-[0.75rem] font-medium tabular-nums text-neutral-400">
                  {stage.index}
                </span>
                <h3 className="text-h3 font-medium text-ink">{stage.title}</h3>
                <span className="ml-auto text-[0.75rem] tabular-nums text-neutral-400">
                  {stage.meta}
                </span>
              </div>

              <p className="mt-3 max-w-xl text-[0.9375rem] leading-relaxed text-neutral-600">
                {stage.description}
              </p>

              <StageVisual id={stage.id} index={index} />
            </motion.li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

function StageVisual({ id, index }: { id: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-15% 0px" }}
      transition={{ duration: 0.9, ease: EASE_EDITORIAL, delay: 0.12 }}
      className="mt-6 overflow-hidden rounded-md border border-ink/8 bg-paper p-5"
    >
      {id === "briefing" && <BriefingVisual />}
      {id === "analise" && <AnalysisVisual />}
      {id === "criacao" && <CreationVisual />}
      {id === "resultado" && <ResultVisual />}
      <span className="sr-only">Etapa {index + 1}</span>
    </motion.div>
  );
}

function BriefingVisual() {
  const fields = [
    { label: "Nome da marca", value: "Norte", filled: true },
    { label: "Segmento", value: "Arquitetura", filled: true },
    { label: "Percepção desejada", value: "Precisa, silenciosa, durável", filled: true },
    { label: "Público", value: "", filled: false },
  ];
  return (
    <div className="space-y-2">
      {fields.map((field, i) => (
        <motion.div
          key={field.label}
          initial={{ opacity: 0, x: -8 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE_EDITORIAL, delay: 0.1 + i * 0.08 }}
          className={cn(
            "flex items-center justify-between gap-4 rounded-[4px] border px-3 py-2.5 text-[0.8125rem]",
            field.filled ? "border-ink/10 bg-off-white/50" : "border-dashed border-ink/12"
          )}
        >
          <span className="text-neutral-400">{field.label}</span>
          <span className="truncate font-medium text-ink">
            {field.filled ? field.value : <span className="text-neutral-300">—</span>}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function AnalysisVisual() {
  const tokens = [
    { word: "precisa", strong: true },
    { word: "silenciosa", strong: true },
    { word: "durável", strong: true },
    { word: "moderna", strong: false },
    { word: "acolhedora", strong: false },
    { word: "artesanal", strong: false },
    { word: "geométrica", strong: true },
    { word: "ornamental", strong: false },
  ];
  return (
    <div className="flex flex-wrap gap-1.5">
      {tokens.map((token, i) => (
        <motion.span
          key={token.word}
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: token.strong ? 1 : 0.35, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: EASE_EDITORIAL, delay: 0.06 * i }}
          className={cn(
            "rounded-full px-3 py-1.5 text-[0.75rem]",
            token.strong
              ? "bg-ink text-off-white"
              : "border border-ink/10 text-neutral-500 line-through decoration-ink/20"
          )}
        >
          {token.word}
        </motion.span>
      ))}
    </div>
  );
}

function CreationVisual() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: EASE_EDITORIAL }}
        className="flex items-center gap-2.5"
      >
        <VMark variant="solid" size={30} tone="ink" />
        <span className="text-xl font-semibold lowercase tracking-[-0.03em] text-ink">norte</span>
      </motion.div>
      <div className="flex gap-1.5">
        {["#12130F", "#F4F2EC", "#9A9384", "#C6F13A"].map((hex, i) => (
          <motion.span
            key={hex}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASE_EDITORIAL, delay: 0.15 + i * 0.07 }}
            className="h-8 w-8 rounded-[3px] ring-1 ring-inset ring-black/5"
            style={{ backgroundColor: hex }}
          />
        ))}
      </div>
      <motion.span
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: EASE_EDITORIAL, delay: 0.4 }}
        className="text-[1.75rem] font-medium leading-none tracking-[-0.04em] text-ink"
      >
        Aa
      </motion.span>
    </div>
  );
}

function ResultVisual() {
  const modules = ["Logo", "Paleta", "Tipografia", "Grid", "Aplicações", "Brand Book"];
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {modules.map((module, i) => (
        <motion.div
          key={module}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: EASE_EDITORIAL, delay: 0.06 * i }}
          className="flex h-16 items-end rounded-[4px] border border-ink/8 bg-off-white/60 p-2.5"
        >
          <span className="text-[0.625rem] uppercase tracking-[0.08em] text-neutral-500">
            {module}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

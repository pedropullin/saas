"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { VMark } from "@/components/ui/VMark";
import { Magnetic } from "@/components/ui/Magnetic";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { TransitionLink } from "@/components/providers/TransitionLink";
import { EASE_EDITORIAL } from "@/lib/motion/easing";
import { cn } from "@/lib/utils";

const editorialFieldClass =
  "h-auto rounded-none border-0 border-b border-off-white/20 bg-transparent px-0 pb-2 text-xl font-medium text-off-white focus:border-accent";

const PERSONALITY_OPTIONS = ["Minimalista", "Sofisticada", "Contemporânea", "Ousada", "Calorosa", "Técnica"];

const PALETTE = [
  { name: "Grafite", hex: "#17170F" },
  { name: "Areia", hex: "#F5F4EF" },
  { name: "Concreto", hex: "#A8A79B" },
  { name: "Lima", hex: "#C6F13A" },
];

const SHAPES = [
  { x: -120, y: -60, size: 34, rotate: -12, delay: 0 },
  { x: 130, y: -80, size: 22, rotate: 20, delay: 0.06 },
  { x: -150, y: 70, size: 18, rotate: 8, delay: 0.12 },
  { x: 150, y: 90, size: 30, rotate: -18, delay: 0.03 },
  { x: 0, y: -130, size: 16, rotate: 30, delay: 0.15 },
  { x: 0, y: 130, size: 24, rotate: -8, delay: 0.09 },
];

type Stage = "idle" | "dissolve" | "shapes" | "symbol" | "type" | "palette" | "assembled";

const STAGE_ORDER: Stage[] = ["dissolve", "shapes", "symbol", "type", "palette", "assembled"];
const STAGE_DURATIONS = [420, 620, 560, 680, 560, 10];

export function BrandGenesis() {
  const [brandName, setBrandName] = useState("Norte");
  const [segment, setSegment] = useState("Arquitetura");
  const [tags, setTags] = useState<string[]>(["Minimalista", "Sofisticada", "Contemporânea"]);
  const [stage, setStage] = useState<Stage>("idle");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  function toggleTag(tag: string) {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  function clearTimers() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }

  function generate() {
    clearTimers();
    let elapsed = 0;
    STAGE_ORDER.forEach((s, i) => {
      elapsed += STAGE_DURATIONS[i] ?? 500;
      timers.current.push(setTimeout(() => setStage(s), elapsed));
    });
  }

  function reset() {
    clearTimers();
    setStage("idle");
  }

  useEffect(() => clearTimers, []);

  const isGenerating = stage !== "idle" && stage !== "assembled";
  const isDone = stage === "assembled";

  return (
    <section id="briefing" className="relative overflow-hidden bg-ink py-40">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.035]">
        <VMark variant="cropped" size={900} tone="paper" />
      </div>

      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <p className="text-label font-medium uppercase tracking-[0.08em] text-off-white/40">
          Uma identidade em tempo real
        </p>
        <h2 className="mt-4 text-h1 font-medium text-off-white">Veja uma marca nascer.</h2>
        <p className="mx-auto mt-4 max-w-md text-body-lg text-off-white/55">
          Preencha um briefing curto. A VEYRO monta o sistema de marca diante dos seus olhos — sem
          barra de progresso, sem espera vazia.
        </p>
      </div>

      <div className="relative mx-auto mt-16 flex min-h-[480px] max-w-2xl items-center justify-center px-6">
        <AnimatePresence mode="wait">
          {stage === "idle" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, filter: "blur(6px)" }}
              transition={{ duration: 0.5, ease: EASE_EDITORIAL }}
              className="w-full rounded-md border border-off-white/12 bg-off-white/[0.03] p-8 text-left backdrop-blur-sm"
            >
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <Label htmlFor="brand-name" className="text-off-white/40">
                    Nome
                  </Label>
                  <Input
                    id="brand-name"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    maxLength={18}
                    className={editorialFieldClass}
                  />
                </div>
                <div>
                  <Label htmlFor="brand-segment" className="text-off-white/40">
                    Segmento
                  </Label>
                  <Input
                    id="brand-segment"
                    value={segment}
                    onChange={(e) => setSegment(e.target.value)}
                    maxLength={24}
                    className={editorialFieldClass}
                  />
                </div>
              </div>

              <div className="mt-7">
                <span className="text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-off-white/40">
                  Personalidade
                </span>
                <div className="mt-3 flex flex-wrap gap-2">
                  {PERSONALITY_OPTIONS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      data-cursor="v"
                      className={cn(
                        "rounded-full border px-3.5 py-1.5 text-[0.8125rem] font-medium transition-colors",
                        tags.includes(tag)
                          ? "border-accent bg-accent text-accent-ink"
                          : "border-off-white/20 text-off-white/60 hover:border-off-white/40"
                      )}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <Magnetic className="mt-9 block w-full">
                <button
                  type="button"
                  onClick={generate}
                  disabled={!brandName.trim() || tags.length === 0}
                  data-cursor="v"
                  className="w-full rounded-[3px] bg-accent py-4 text-[0.9375rem] font-medium text-accent-ink transition-opacity disabled:opacity-40"
                >
                  Gerar identidade
                </button>
              </Magnetic>
            </motion.div>
          )}

          {isGenerating && (
            <motion.div
              key="stage"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative flex h-[480px] w-full items-center justify-center"
            >
              {/* scattering shapes */}
              {(stage === "shapes" || stage === "symbol" || stage === "type" || stage === "palette") && (
                <>
                  {SHAPES.map((shape, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                      animate={{
                        opacity: stage === "shapes" ? 0.9 : 0,
                        scale: 1,
                        x: shape.x,
                        y: shape.y,
                        rotate: shape.rotate,
                      }}
                      transition={{ duration: 0.6, delay: shape.delay, ease: EASE_EDITORIAL }}
                      className="absolute rounded-[3px] border border-accent/70"
                      style={{ width: shape.size, height: shape.size }}
                    />
                  ))}
                </>
              )}

              {/* V assembling */}
              <motion.div
                initial={{ opacity: 0, scale: 0.6, rotate: -12 }}
                animate={{
                  opacity: stage === "symbol" ? 1 : stage === "type" || stage === "palette" ? 0.14 : 0,
                  scale: stage === "symbol" ? 1 : 0.7,
                  rotate: 0,
                  y: stage === "type" || stage === "palette" ? -120 : 0,
                }}
                transition={{ duration: 0.55, ease: EASE_EDITORIAL }}
                className="absolute"
              >
                <VMark variant="solid" size={88} tone="accent" />
              </motion.div>

              {/* typography reveal */}
              {(stage === "type" || stage === "palette") && (
                <motion.div className="absolute flex" style={{ marginTop: stage === "palette" ? -40 : 0 }}>
                  {brandName.split("").map((char, i) => (
                    <motion.span
                      key={`${char}-${i}`}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.045, ease: EASE_EDITORIAL }}
                      className="text-6xl font-semibold tracking-[-0.03em] text-off-white"
                    >
                      {char === " " ? " " : char}
                    </motion.span>
                  ))}
                </motion.div>
              )}

              {/* palette */}
              {stage === "palette" && (
                <div className="absolute mt-24 flex gap-2">
                  {PALETTE.map((color, i) => (
                    <motion.span
                      key={color.hex}
                      initial={{ opacity: 0, scale: 0, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 + i * 0.08, ease: EASE_EDITORIAL }}
                      className="h-10 w-10 rounded-[4px]"
                      style={{ backgroundColor: color.hex }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {isDone && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: EASE_EDITORIAL }}
              className="w-full max-w-md overflow-hidden rounded-md border border-off-white/12 bg-off-white text-ink"
            >
              <div className="flex items-center justify-between border-b border-ink/8 px-6 py-5">
                <div className="flex items-center gap-2.5">
                  <VMark variant="solid" size={22} tone="ink" />
                  <span className="text-lg font-semibold lowercase tracking-[-0.02em]">{brandName}</span>
                </div>
                <span className="text-[0.6875rem] uppercase tracking-[0.08em] text-neutral-400">{segment}</span>
              </div>
              <div className="grid grid-cols-4">
                {PALETTE.map((color) => (
                  <div key={color.hex} className="h-14" style={{ backgroundColor: color.hex }} />
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5 px-6 py-5">
                {tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-ink/10 px-3 py-1 text-[0.75rem] text-neutral-600">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-3 border-t border-ink/8 px-6 py-5">
                <Magnetic>
                  <TransitionLink
                    href="/app/criar"
                    data-cursor="v"
                    className="inline-flex items-center justify-center rounded-[3px] bg-ink px-5 py-3 text-[0.8125rem] font-medium text-off-white transition-colors hover:bg-accent hover:text-accent-ink"
                  >
                    Continuar essa marca
                  </TransitionLink>
                </Magnetic>
                <button
                  type="button"
                  onClick={reset}
                  className="text-[0.8125rem] font-medium text-neutral-500 transition-colors hover:text-ink"
                >
                  Gerar outra
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { VMark } from "@/components/ui/VMark";
import { EASE_EDITORIAL } from "@/lib/motion/easing";
import type { VMarkVariant } from "@/lib/types";

const READINGS: { variant: VMarkVariant; label: string }[] = [
  { variant: "solid", label: "Sólido" },
  { variant: "outline", label: "Contorno" },
  { variant: "cropped", label: "Recortado" },
  { variant: "split", label: "Duas superfícies" },
  { variant: "stacked", label: "Empilhado" },
  { variant: "mono", label: "Monograma" },
];

const CYCLE: VMarkVariant[] = ["solid", "split", "stacked", "cropped", "outline", "solid"];

export function VSymbolSystem() {
  const [morphing, setMorphing] = useState(false);
  const [asInterface, setAsInterface] = useState(false);
  const [cycleIndex, setCycleIndex] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function transform() {
    if (morphing) return;
    setAsInterface(false);
    setMorphing(true);
    setCycleIndex(0);
    CYCLE.forEach((_, i) => {
      timers.current.push(
        setTimeout(() => setCycleIndex(i), 220 * i)
      );
    });
    timers.current.push(
      setTimeout(() => {
        setAsInterface(true);
        setMorphing(false);
      }, 220 * CYCLE.length + 200)
    );
  }

  return (
    <section className="bg-ink py-32">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <p className="text-label font-medium uppercase tracking-[0.08em] text-off-white/40">O símbolo</p>
        <h2 className="mt-4 text-h1 font-medium text-off-white">Tudo nasce do V.</h2>
        <p className="mx-auto mt-4 max-w-md text-body-lg text-off-white/55">
          Uma única geometria, seis leituras — e a base de toda interface que a VEYRO constrói.
        </p>
      </div>

      <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-3 px-6 sm:grid-cols-3">
        {READINGS.map((r, i) => (
          <motion.div
            key={r.variant}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.5, delay: i * 0.06, ease: EASE_EDITORIAL }}
            whileHover={{ y: -4 }}
            className="flex flex-col items-center justify-center gap-4 rounded-md border border-off-white/10 bg-off-white/[0.02] py-10"
          >
            <VMark variant={r.variant} size={44} tone="paper" />
            <span className="text-[0.75rem] font-medium uppercase tracking-[0.06em] text-off-white/45">
              {r.label}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="mx-auto mt-20 flex max-w-md flex-col items-center px-6 text-center">
        <div className="relative flex h-40 w-full items-center justify-center">
          <AnimatePresence mode="wait">
            {!asInterface ? (
              <motion.div
                key="mark"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.15 }}
                transition={{ duration: 0.3, ease: EASE_EDITORIAL }}
              >
                <VMark variant={CYCLE[cycleIndex] ?? "solid"} size={80} tone="accent" breathe={!morphing} />
              </motion.div>
            ) : (
              <motion.div
                key="frame"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45, ease: EASE_EDITORIAL }}
                className="w-full max-w-sm overflow-hidden rounded-md border border-off-white/15"
              >
                <div className="flex items-center gap-1.5 border-b border-off-white/10 bg-off-white/[0.03] px-4 py-2.5">
                  <span className="h-2 w-2 rounded-full bg-off-white/20" />
                  <span className="h-2 w-2 rounded-full bg-off-white/20" />
                  <span className="h-2 w-2 rounded-full bg-off-white/20" />
                  <span className="ml-2 flex items-center gap-1.5">
                    <VMark variant="solid" size={11} tone="accent" />
                    <span className="text-[0.6875rem] text-off-white/40">veyro.app</span>
                  </span>
                </div>
                <div className="flex h-24 items-center justify-center bg-off-white/[0.02]">
                  <VMark variant="mono" size={28} tone="paper" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button
          type="button"
          onClick={transform}
          disabled={morphing}
          data-cursor="v"
          className="mt-8 rounded-[3px] border border-off-white/20 px-6 py-3 text-[0.8125rem] font-medium text-off-white transition-colors hover:border-accent hover:text-accent disabled:opacity-40"
        >
          {asInterface ? "Transformar novamente" : "Transformar em interface"}
        </button>
      </div>
    </section>
  );
}

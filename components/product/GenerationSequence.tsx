"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { VMark } from "@/components/ui/VMark";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useGenerationSequence } from "@/hooks/useGenerationSequence";
import { GENERATION_STEPS } from "@/lib/mock/demo-sequence";
import { EASE_EDITORIAL } from "@/lib/motion/easing";

/**
 * Full-width "identity being built" sequence used at the end of onboarding.
 * Deliberately not a spinner — modules stack up in view as each step completes.
 */
export function GenerationSequence({ onDone, brandName }: { onDone: () => void; brandName: string }) {
  const { stepIndex, currentStep, progress, isDone } = useGenerationSequence(GENERATION_STEPS, {
    autoStart: true,
  });

  useEffect(() => {
    if (isDone) {
      const timeout = setTimeout(onDone, 900);
      return () => clearTimeout(timeout);
    }
  }, [isDone, onDone]);

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center py-16 text-center">
      <VMark variant="solid" size={72} tone="ink" progress={progress} />
      <p className="mt-8 text-[0.75rem] font-medium uppercase tracking-[0.08em] text-neutral-500">
        Construindo a identidade de {brandName || "sua marca"}
      </p>
      <div className="mt-4 h-6">
        <AnimatePresence mode="wait">
          <motion.p
            key={currentStep?.id ?? "start"}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: EASE_EDITORIAL }}
            className="text-h3 font-medium text-ink"
          >
            {isDone ? "Sistema de marca pronto" : currentStep?.label}
          </motion.p>
        </AnimatePresence>
      </div>
      <ProgressBar progress={progress} className="mt-6 w-64" />
      <div className="mt-10 flex gap-3">
        {GENERATION_STEPS.map((step, i) => (
          <span
            key={step.id}
            className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
              i <= stepIndex || isDone ? "bg-accent" : "bg-ink/10"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

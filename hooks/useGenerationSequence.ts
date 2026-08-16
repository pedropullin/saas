"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GenerationStep } from "@/lib/types";
import { useMounted } from "./useMounted";

interface GenerationSequenceState {
  stepIndex: number;
  currentStep: GenerationStep | undefined;
  progress: number;
  isDone: boolean;
  isRunning: boolean;
  start: () => void;
  restart: () => void;
}

/**
 * Drives the "identity being generated" sequence shared by the marketing
 * live-demo section and the /app/criar onboarding flow. Pure timers, no
 * network — this is a simulated construction of the brand, not a real
 * generation job.
 */
export function useGenerationSequence(
  steps: GenerationStep[],
  { autoStart = false }: { autoStart?: boolean } = {}
): GenerationSequenceState {
  const mounted = useMounted();
  const [stepIndex, setStepIndex] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Recursive timer chain lives in a ref so it isn't re-created (and doesn't
  // need to reference itself before it's declared) on every render.
  const advanceRef = useRef<(index: number) => void>(() => {});

  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    advanceRef.current = (index: number) => {
      if (index >= steps.length) {
        setStepIndex(index);
        setIsRunning(false);
        return;
      }
      setStepIndex(index);
      const step = steps[index];
      if (!step) {
        setIsRunning(false);
        return;
      }
      // jitter only after mount so SSR/CSR markup never disagrees on timing
      const jitter = mounted ? Math.round((Math.random() - 0.5) * 160) : 0;
      timeoutRef.current = setTimeout(() => {
        advanceRef.current(index + 1);
      }, Math.max(300, step.durationMs + jitter));
    };
  }, [mounted, steps]);

  const start = useCallback(() => {
    clear();
    setIsRunning(true);
    advanceRef.current(0);
  }, [clear]);

  const restart = useCallback(() => {
    clear();
    setStepIndex(-1);
    setIsRunning(true);
    advanceRef.current(0);
  }, [clear]);

  useEffect(() => {
    // Starting the timer chain is an external-system side effect (like
    // kicking off an animation), not derived state — the canonical
    // justified use of an effect, so this is intentionally exempted below.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (autoStart) start();
    return clear;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]);

  const clampedIndex = Math.min(Math.max(stepIndex, 0), Math.max(steps.length - 1, 0));
  const isDone = stepIndex >= steps.length;
  const progress = steps.length === 0 ? 0 : Math.min(1, (stepIndex + (isDone ? 0 : 1)) / steps.length);

  return {
    stepIndex,
    currentStep: stepIndex >= 0 ? steps[clampedIndex] : undefined,
    progress: isDone ? 1 : progress,
    isDone,
    isRunning,
    start,
    restart,
  };
}

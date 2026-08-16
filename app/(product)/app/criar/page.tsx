"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ONBOARDING_QUESTIONS } from "@/lib/constants";
import { OnboardingQuestionStep } from "@/components/product/OnboardingQuestionStep";
import { GenerationSequence } from "@/components/product/GenerationSequence";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { EASE_EDITORIAL } from "@/lib/motion/easing";

type Answers = Record<string, string | string[]>;

export default function CriarIdentidadePage() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [generating, setGenerating] = useState(false);

  const question = ONBOARDING_QUESTIONS[index];
  const isLast = index === ONBOARDING_QUESTIONS.length - 1;
  const brandName = typeof answers.brandName === "string" ? answers.brandName : "";

  if (generating) {
    return (
      <div className="mx-auto max-w-2xl">
        <GenerationSequence brandName={brandName} onDone={() => router.push("/app/identidade/id-norte")} />
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="mx-auto max-w-2xl py-6">
      <p className="text-label font-medium uppercase tracking-[0.08em] text-neutral-500">
        Vamos criar sua marca.
      </p>
      <ProgressBar
        progress={(index + 1) / ONBOARDING_QUESTIONS.length}
        className="mt-4"
      />

      <div className="mt-14 min-h-[220px]">
        <AnimatePresence mode="wait">
          <OnboardingQuestionStep
            key={question.id}
            question={question}
            value={answers[question.id] ?? ""}
            onChange={(value) => setAnswers((prev) => ({ ...prev, [question.id]: value }))}
          />
        </AnimatePresence>
      </div>

      <motion.div
        className="mt-12 flex items-center justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: EASE_EDITORIAL, delay: 0.15 }}
      >
        <button
          type="button"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className="text-[0.875rem] font-medium text-neutral-500 transition-colors hover:text-ink disabled:opacity-0"
        >
          Voltar
        </button>

        {isLast ? (
          <Button onClick={() => setGenerating(true)}>Gerar identidade</Button>
        ) : (
          <Button onClick={() => setIndex((i) => i + 1)}>Continuar</Button>
        )}
      </motion.div>
    </div>
  );
}

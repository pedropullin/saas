"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { EASE_EDITORIAL } from "@/lib/motion/easing";

export interface OnboardingQuestion {
  id: string;
  question: string;
  placeholder: string;
  type: "text" | "textarea" | "tags";
}

const TAG_OPTIONS = [
  "Moderna",
  "Minimalista",
  "Sofisticada",
  "Ousada",
  "Clássica",
  "Divertida",
  "Confiável",
  "Premium",
  "Acessível",
];

export function OnboardingQuestionStep({
  question,
  value,
  onChange,
}: {
  question: OnboardingQuestion;
  value: string | string[];
  onChange: (value: string | string[]) => void;
}) {
  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.4, ease: EASE_EDITORIAL }}
    >
      <h2 className="text-h2 font-medium text-ink text-balance">{question.question}</h2>

      <div className="mt-8">
        {question.type === "text" && (
          <input
            autoFocus
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            className="w-full border-b-2 border-ink/15 bg-transparent pb-3 text-h3 font-medium text-ink outline-none transition-colors placeholder:text-neutral-300 focus:border-accent"
          />
        )}

        {question.type === "textarea" && (
          <textarea
            autoFocus
            rows={3}
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            className="w-full resize-none border-b-2 border-ink/15 bg-transparent pb-3 text-h3 font-medium text-ink outline-none transition-colors placeholder:text-neutral-300 focus:border-accent"
          />
        )}

        {question.type === "tags" && (
          <div className="flex flex-wrap gap-2.5">
            {TAG_OPTIONS.map((tag) => {
              const selected = Array.isArray(value) && value.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    const current = Array.isArray(value) ? value : [];
                    if (selected) {
                      onChange(current.filter((t) => t !== tag));
                    } else if (current.length < 3) {
                      onChange([...current, tag]);
                    }
                  }}
                  className={cn(
                    "rounded-full border px-4 py-2 text-[0.875rem] font-medium transition-colors",
                    selected
                      ? "border-accent bg-accent text-accent-ink"
                      : "border-ink/15 text-ink hover:border-ink"
                  )}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}

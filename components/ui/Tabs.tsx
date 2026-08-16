"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { EASE_EDITORIAL } from "@/lib/motion/easing";

export function Tabs<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex items-center gap-1 rounded-[4px] bg-neutral-100 p-1", className)}>
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "relative rounded-[3px] px-3.5 py-1.5 text-[0.8125rem] font-medium transition-colors",
              isActive ? "text-ink" : "text-neutral-500 hover:text-ink"
            )}
          >
            {isActive && (
              <motion.span
                layoutId="tabs-active"
                className="absolute inset-0 rounded-[3px] bg-paper shadow-subtle"
                transition={{ duration: 0.3, ease: EASE_EDITORIAL }}
              />
            )}
            <span className="relative z-10">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

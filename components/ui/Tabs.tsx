"use client";

import { useId } from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { EASE_EDITORIAL } from "@/lib/motion/easing";

/** Radix Tabs under the hood (roving tabindex, ARIA) — same pill-highlight visual as before. */
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
  const layoutId = useId();

  return (
    <TabsPrimitive.Root value={value} onValueChange={(v) => onChange(v as T)}>
      <TabsPrimitive.List
        className={cn("inline-flex items-center gap-1 rounded-[4px] bg-neutral-100 p-1", className)}
      >
        {options.map((option) => {
          const isActive = option.value === value;
          return (
            <TabsPrimitive.Trigger
              key={option.value}
              value={option.value}
              className="relative rounded-[3px] px-3.5 py-1.5 text-[0.8125rem] font-medium outline-none transition-colors data-[state=inactive]:text-neutral-500 data-[state=active]:text-ink data-[state=inactive]:hover:text-ink"
            >
              {isActive && (
                <motion.span
                  layoutId={`tabs-active-${layoutId}`}
                  className="absolute inset-0 rounded-[3px] bg-paper shadow-subtle"
                  transition={{ duration: 0.3, ease: EASE_EDITORIAL }}
                />
              )}
              <span className="relative z-10">{option.label}</span>
            </TabsPrimitive.Trigger>
          );
        })}
      </TabsPrimitive.List>
    </TabsPrimitive.Root>
  );
}

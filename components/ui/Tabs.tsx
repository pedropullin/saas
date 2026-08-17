"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { EASE_EDITORIAL } from "@/lib/motion/easing";

/**
 * shadcn/ui's Tabs primitive (Radix), used here purely as a segmented
 * control — no TabsContent panels, since every call site swaps external
 * state rather than switching in-place content.
 */
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
    <TabsPrimitive.Root
      value={value}
      onValueChange={(next) => onChange(next as T)}
      className={cn("inline-flex", className)}
    >
      <TabsPrimitive.List className="inline-flex items-center gap-1 rounded-[4px] bg-neutral-100 p-1">
        {options.map((option) => {
          const isActive = option.value === value;
          return (
            <TabsPrimitive.Trigger
              key={option.value}
              value={option.value}
              className="relative rounded-[3px] px-3.5 py-1.5 text-[0.8125rem] font-medium text-neutral-500 outline-none transition-colors data-[state=active]:text-ink"
            >
              {isActive && (
                <motion.span
                  layoutId="tabs-active"
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

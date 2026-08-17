"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { ForkKnife, type Icon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

type Tone = "char" | "terracotta" | "void";

const TONE_GRADIENT: Record<Tone, string> = {
  char: "radial-gradient(120% 120% at 20% 0%, #2a2019 0%, #14100d 55%, #0b0908 100%)",
  terracotta: "radial-gradient(120% 120% at 80% 100%, #3a2013 0%, #1d1712 55%, #0b0908 100%)",
  void: "radial-gradient(120% 120% at 50% 0%, #1d1712 0%, #0b0908 65%, #080706 100%)",
};

interface PlaceholderImageProps extends HTMLMotionProps<"div"> {
  /** What real photo belongs here — shown as a small, honest caption. Never claimed as a real photo. */
  label: string;
  tone?: Tone;
  icon?: Icon;
  /** Hide the caption for decorative/background use where it would clutter. */
  showCaption?: boolean;
}

/**
 * Honest stand-in for restaurant photography we don't have publishing rights
 * to pull from Instagram/Google yet (network-blocked in this environment).
 * Deliberately non-photographic — an abstract gradient + grain field, never
 * a stock food photo — so it can never be mistaken for a real picture of
 * Afago. Swap for a real <img>/<Image> once photos are supplied; every call
 * site only needs its `src` changed.
 */
export function PlaceholderImage({
  label,
  tone = "char",
  icon: IconCmp = ForkKnife,
  showCaption = true,
  className,
  ...motionProps
}: PlaceholderImageProps) {
  return (
    <motion.div
      className={cn("afago-grain relative overflow-hidden", className)}
      style={{ background: TONE_GRADIENT[tone] }}
      {...motionProps}
    >
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.14]">
        <IconCmp size="30%" weight="thin" color="var(--color-afago-cream)" />
      </div>
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, transparent 0, transparent 46px, color-mix(in srgb, var(--color-afago-cream) 4%, transparent) 47px)",
        }}
      />
      {showCaption && (
        // A single, compact corner badge — never a full-width bar — so it
        // survives the cinematic zoom transforms applied by callers without
        // clipping against the viewport edge on both sides at once.
        <div
          className="absolute bottom-3 left-3 z-[3] max-w-[78%] rounded-full bg-afago-void/55 px-3 py-1.5 backdrop-blur-sm sm:bottom-4 sm:left-4"
          title={label}
        >
          <span className="block truncate font-mono text-[0.6rem] uppercase tracking-[0.14em] text-afago-cream-dim/80 sm:text-[0.65rem]">
            Foto real em breve · {label}
          </span>
        </div>
      )}
    </motion.div>
  );
}

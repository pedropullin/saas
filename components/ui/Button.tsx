"use client";

import Link from "next/link";
import { motion, useMotionValue, useSpring } from "framer-motion";
import type { PointerEvent, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { EASE_EDITORIAL } from "@/lib/motion/easing";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const VARIANT_CLASS: Record<Variant, string> = {
  primary: "bg-ink text-off-white hover:bg-accent hover:text-accent-ink",
  secondary:
    "border border-ink/15 text-ink bg-transparent hover:border-ink hover:bg-ink hover:text-off-white",
  ghost: "text-ink hover:text-accent-dim",
};

const SIZE_CLASS: Record<Size, string> = {
  sm: "px-4 py-2 text-[0.8125rem]",
  md: "px-6 py-3.5 text-[0.9375rem]",
  lg: "px-8 py-4 text-base",
};

interface BaseProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  /** Subtle pointer-attraction on hover — reserved for a page's one or two hero CTAs, not dense UI. */
  magnetic?: boolean;
}

interface ButtonAsButton extends BaseProps {
  href?: undefined;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
  "aria-pressed"?: boolean;
  "data-cursor"?: string;
  "data-cursor-label"?: string;
}

interface ButtonAsLink extends BaseProps {
  href: string;
  target?: string;
  rel?: string;
  "data-cursor"?: string;
  "data-cursor-label"?: string;
}

type ButtonProps = ButtonAsButton | ButtonAsLink;

const base =
  "inline-flex items-center justify-center gap-2 rounded-[3px] font-medium tracking-[-0.01em] transition-colors duration-200";

/** Pointer-attraction: the whole button drifts a few px toward the cursor while hovered. */
function useMagnetic(strength = 12) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 220, damping: 16, mass: 0.3 });
  const springY = useSpring(y, { stiffness: 220, damping: 16, mass: 0.3 });

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const relX = event.clientX - (rect.left + rect.width / 2);
    const relY = event.clientY - (rect.top + rect.height / 2);
    x.set((relX / (rect.width / 2)) * strength);
    y.set((relY / (rect.height / 2)) * strength);
  };
  const onPointerLeave = () => {
    x.set(0);
    y.set(0);
  };

  return { x: springX, y: springY, onPointerMove, onPointerLeave };
}

export function Button(props: ButtonProps) {
  const { variant = "primary", size = "md", className, children, magnetic = false } = props;
  const classes = cn(base, VARIANT_CLASS[variant], SIZE_CLASS[size], className);
  const magneticProps = useMagnetic();

  const motionProps = magnetic
    ? {
        style: { x: magneticProps.x, y: magneticProps.y },
        onPointerMove: magneticProps.onPointerMove,
        onPointerLeave: magneticProps.onPointerLeave,
        whileTap: { scale: 0.97 },
        transition: { duration: 0.2, ease: EASE_EDITORIAL },
      }
    : {
        whileHover: { y: -2 },
        whileTap: { y: 0, scale: 0.98 },
        transition: { duration: 0.2, ease: EASE_EDITORIAL },
      };

  if ("href" in props && props.href) {
    const { href, target, rel } = props;
    return (
      <motion.span {...motionProps} className={cn("inline-block", className)}>
        <Link
          href={href}
          target={target}
          rel={rel}
          data-cursor={props["data-cursor"]}
          data-cursor-label={props["data-cursor-label"]}
          className={cn(base, VARIANT_CLASS[variant], SIZE_CLASS[size], "w-full")}
        >
          {children}
        </Link>
      </motion.span>
    );
  }

  const buttonProps = props as ButtonAsButton;
  const { type = "button", disabled, onClick } = buttonProps;

  return (
    <motion.button
      {...motionProps}
      type={type}
      disabled={disabled}
      onClick={onClick}
      aria-pressed={buttonProps["aria-pressed"]}
      data-cursor={buttonProps["data-cursor"]}
      data-cursor-label={buttonProps["data-cursor-label"]}
      className={classes}
    >
      {children}
    </motion.button>
  );
}

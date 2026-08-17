"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { EASE_EDITORIAL } from "@/lib/motion/easing";

/**
 * shadcn/ui-style variant map — VEYRO's palette (ink / off-white / accent)
 * in place of the default shadcn slate theme.
 */
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-[3px] font-medium tracking-[-0.01em] transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-ink text-off-white hover:bg-accent hover:text-accent-ink",
        secondary:
          "border border-ink/15 bg-transparent text-ink hover:border-ink hover:bg-ink hover:text-off-white",
        ghost: "text-ink hover:text-accent-dim",
      },
      size: {
        sm: "px-4 py-2 text-[0.8125rem]",
        md: "px-6 py-3.5 text-[0.9375rem]",
        lg: "px-8 py-4 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

type ButtonVariants = VariantProps<typeof buttonVariants>;

interface BaseProps extends ButtonVariants {
  className?: string;
  children: ReactNode;
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

export function Button(props: ButtonProps) {
  const { variant, size, className, children } = props;

  const motionProps = {
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
          className={cn(buttonVariants({ variant, size }), "w-full")}
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
      className={cn(buttonVariants({ variant, size }), className)}
    >
      {children}
    </motion.button>
  );
}

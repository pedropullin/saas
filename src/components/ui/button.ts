import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "light" | "outline" | "ghost" | "danger" | "subtle";
export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl" | "icon" | "icon-sm";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-brand text-white hover:bg-brand-strong hover:shadow-glow",
  light: "bg-paper text-ink hover:bg-white/90",
  outline: "border border-line-2 bg-ink-3/60 text-paper hover:border-white/40 hover:bg-white/[0.04]",
  subtle: "bg-white/[0.06] text-paper hover:bg-white/[0.1]",
  ghost: "text-mute-2 hover:bg-white/[0.06] hover:text-paper",
  danger: "border border-brand/50 text-brand hover:bg-brand/10",
};

const SIZES: Record<ButtonSize, string> = {
  xs: "h-7 gap-1 rounded-md px-2 text-xs",
  sm: "h-8 gap-1.5 rounded-lg px-3 text-[13px]",
  md: "h-10 gap-2 rounded-xl px-4 text-sm",
  lg: "h-12 gap-2 rounded-xl px-5 text-[15px]",
  xl: "h-14 gap-2.5 rounded-2xl px-7 text-base",
  icon: "h-10 w-10 rounded-xl",
  "icon-sm": "h-8 w-8 rounded-lg",
};

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string | false | null): string {
  return cn(
    "inline-flex shrink-0 select-none items-center justify-center font-medium whitespace-nowrap transition-all duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

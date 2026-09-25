import { cn } from "@/lib/utils";

type Variant = "primary" | "light" | "outline" | "ghost" | "danger-outline";
type Size = "sm" | "md" | "lg" | "icon";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-brand text-white hover:bg-brand-strong shadow-[0_8px_30px_-8px_rgba(255,46,46,0.6)]",
  light: "bg-paper text-ink hover:bg-white",
  outline: "border border-line-2 text-paper hover:border-paper/60 hover:bg-white/[0.03]",
  ghost: "text-mute-2 hover:text-paper hover:bg-white/[0.05]",
  "danger-outline": "border border-brand/50 text-brand hover:bg-brand/10",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px] gap-1.5 rounded-lg",
  md: "h-10 px-4 text-sm gap-2 rounded-xl",
  lg: "h-12 px-6 text-[15px] gap-2 rounded-xl",
  icon: "h-9 w-9 rounded-lg",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string): string {
  return cn(
    "inline-flex shrink-0 select-none items-center justify-center font-medium whitespace-nowrap transition-colors duration-150 disabled:pointer-events-none disabled:opacity-40",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

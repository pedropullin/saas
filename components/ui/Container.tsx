import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Container({
  children,
  className,
  as: As = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
}) {
  return (
    <As className={cn("mx-auto w-full max-w-[var(--container-page)] px-6 md:px-10", className)}>
      {children}
    </As>
  );
}

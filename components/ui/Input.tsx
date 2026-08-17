import * as React from "react";
import { cn } from "@/lib/utils";

/** shadcn/ui's Input primitive, restyled for VEYRO's dark-form / light-form contexts via className. */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full min-w-0 rounded-[4px] border border-ink/15 bg-transparent px-4 py-3 text-[0.9375rem] text-ink outline-none transition-colors placeholder:text-neutral-400 focus:border-accent-dim disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Input };

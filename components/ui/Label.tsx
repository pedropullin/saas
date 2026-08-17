"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/lib/utils";

/** shadcn/ui's Label primitive (Radix), styled as VEYRO's small uppercase field caption. */
function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      className={cn(
        "mb-2 block text-[0.75rem] font-medium uppercase tracking-[0.06em] text-neutral-500 select-none",
        className
      )}
      {...props}
    />
  );
}

export { Label };

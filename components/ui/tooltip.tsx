"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 8, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 rounded-[4px] bg-ink px-2.5 py-1.5 text-[0.6875rem] font-medium text-off-white shadow-subtle",
        "transition-[opacity,transform] duration-150 ease-out",
        "data-[state=closed]:scale-95 data-[state=closed]:opacity-0 data-[state=delayed-open]:scale-100 data-[state=delayed-open]:opacity-100",
        className
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = "TooltipContent";

export { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent };

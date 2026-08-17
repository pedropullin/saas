"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

/**
 * shadcn/ui-style Sheet (Radix Dialog under the hood) — gives us a real
 * focus-trap and scroll-lock for the mobile nav instead of a hand-rolled
 * div. Restyled with VEYRO tokens: sharp corners, ink/off-white/accent
 * palette, no default shadcn gray. Exit animation is a plain CSS transition
 * keyed off Radix's own `data-state` attribute — Radix's Presence waits for
 * it to finish before unmounting, so no extra animation library is needed
 * here.
 */

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;

type Side = "top" | "right";

const SIDE_CLASS: Record<Side, string> = {
  top: "inset-x-0 top-0 border-b border-ink/8 data-[state=closed]:-translate-y-full data-[state=open]:translate-y-0",
  right:
    "inset-y-0 right-0 h-full w-full max-w-sm border-l border-ink/8 data-[state=closed]:translate-x-full data-[state=open]:translate-x-0",
};

const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { side?: Side; showClose?: boolean }
>(({ className, children, side = "right", showClose = true, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay
      className="fixed inset-0 z-[70] bg-ink/30 backdrop-blur-[2px] transition-opacity duration-300 data-[state=closed]:opacity-0 data-[state=open]:opacity-100"
    />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-[71] bg-off-white shadow-lifted transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        SIDE_CLASS[side],
        className
      )}
      {...props}
    >
      {children}
      {showClose && (
        <DialogPrimitive.Close
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-[3px] bg-off-white text-ink transition-colors hover:bg-ink/5"
          aria-label="Fechar"
        >
          <X size={18} weight="regular" />
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
SheetContent.displayName = "SheetContent";

export { Sheet, SheetTrigger, SheetClose, SheetContent };

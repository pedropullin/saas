"use client";

import type { ReactNode } from "react";
import { Sheet, SheetContent } from "@/components/ui/Sheet";

/**
 * Lateral reveal used across the admin for row detail — deliberately not a
 * centered modal. Thin VEYRO wrapper over shadcn/ui's Sheet (Radix Dialog)
 * so call sites keep the simple open/onClose API.
 */
export function SlideOver({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent side="right" className="overflow-y-auto p-0" hideClose>
        {children}
      </SheetContent>
    </Sheet>
  );
}

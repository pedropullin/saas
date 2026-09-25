"use client";

import { useToasts } from "@/lib/toast";
import { cn } from "@/lib/utils";

export function Toaster() {
  const toasts = useToasts();
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-5 z-[100] flex flex-col items-center gap-2 px-4"
    >
      {toasts.map((item) => (
        <div
          key={item.id}
          className={cn(
            "animate-fade-up pointer-events-auto max-w-md rounded-xl border px-4 py-3 text-sm shadow-2xl backdrop-blur",
            item.tone === "error" ? "border-brand/60 bg-brand-deep/90 text-white" : "border-line-2 bg-ink-3/95 text-paper",
          )}
        >
          {item.message}
        </div>
      ))}
    </div>
  );
}

"use client";

import { CheckCircle, WarningCircle, X } from "@phosphor-icons/react";
import { dismiss, useToasts } from "@/client/toast";
import { cn } from "@/lib/utils";

export function Toaster() {
  const toasts = useToasts();
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-20 z-[100] flex flex-col items-center gap-2 px-4 md:bottom-6 md:items-end md:px-6">
      {toasts.map((item) => (
        <div
          key={item.id}
          className={cn(
            "animate-slide-up pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-2xl backdrop-blur",
            item.tone === "error" ? "border-brand/60 bg-[#1a0507]/95" : "border-line-2 bg-ink-3/95",
          )}
        >
          {item.tone === "error" ? (
            <WarningCircle size={18} weight="fill" className="mt-px shrink-0 text-brand" />
          ) : item.tone === "success" ? (
            <CheckCircle size={18} weight="fill" className="mt-px shrink-0 text-brand" />
          ) : null}
          <p className="min-w-0 flex-1 leading-snug text-paper">{item.message}</p>
          {item.action && (
            <button
              type="button"
              onClick={() => {
                item.action!.onClick();
                dismiss(item.id);
              }}
              className="shrink-0 font-semibold text-brand hover:underline"
            >
              {item.action.label}
            </button>
          )}
          <button type="button" onClick={() => dismiss(item.id)} className="shrink-0 text-mute hover:text-paper" aria-label="Fechar aviso">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

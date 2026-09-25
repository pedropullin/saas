"use client";

import { useSyncExternalStore } from "react";

export interface Toast {
  id: number;
  message: string;
  tone: "default" | "success" | "error";
  action?: { label: string; onClick: () => void };
}

let toasts: Toast[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
const EMPTY: Toast[] = [];

function emit() {
  listeners.forEach((listener) => listener());
}

export function dismiss(id: number) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

export function toast(message: string, options: { tone?: Toast["tone"]; action?: Toast["action"]; duration?: number } = {}) {
  const id = nextId++;
  toasts = [...toasts.slice(-2), { id, message, tone: options.tone ?? "default", action: options.action }];
  emit();
  setTimeout(() => dismiss(id), options.duration ?? (options.action ? 6000 : 3500));
}

toast.success = (message: string, action?: Toast["action"]) => toast(message, { tone: "success", action });
toast.error = (message: string) => toast(message, { tone: "error", duration: 5000 });

export function useToasts(): Toast[] {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => toasts,
    () => EMPTY,
  );
}

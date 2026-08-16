"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/**
 * Guards client-only timing (jitter, randomness) so SSR and first paint stay
 * deterministic. Uses useSyncExternalStore — rather than an effect + setState
 * — since this is exactly the "value differs between server and client
 * snapshot" case it's designed for: React reconciles the mismatch itself
 * right after hydration.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
}

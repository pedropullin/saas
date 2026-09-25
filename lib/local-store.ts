import { useSyncExternalStore } from "react";

/**
 * Estado persistido no localStorage, compartilhado entre componentes e abas.
 * O snapshot do servidor é sempre o valor padrão (sem hydration mismatch).
 */
export function createLocalStore<T>(key: string, fallback: T, sanitize: (value: unknown) => T) {
  let cache: T | undefined;
  const listeners = new Set<() => void>();

  function get(): T {
    if (cache !== undefined) return cache;
    if (typeof window === "undefined") return fallback;
    try {
      const raw = window.localStorage.getItem(key);
      cache = raw ? sanitize(JSON.parse(raw)) : fallback;
    } catch {
      cache = fallback;
    }
    return cache;
  }

  function set(update: T | ((previous: T) => T)): void {
    const next = typeof update === "function" ? (update as (previous: T) => T)(get()) : update;
    cache = next;
    try {
      window.localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // Modo privado ou armazenamento cheio: mantém só em memória.
    }
    listeners.forEach((listener) => listener());
  }

  function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    const onStorage = (event: StorageEvent) => {
      if (event.key !== key) return;
      cache = undefined;
      listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  }

  function useValue(): T {
    return useSyncExternalStore(subscribe, get, () => fallback);
  }

  return { get, set, useValue };
}

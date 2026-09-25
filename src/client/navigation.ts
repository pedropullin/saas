"use client";

/** Permite navegar pelo router do Next fora de componentes (toasts, stores). */
let navigator: ((href: string) => void) | null = null;

export function registerNavigator(fn: (href: string) => void) {
  navigator = fn;
}

export function navigate(href: string) {
  if (navigator) navigator(href);
  else window.location.assign(href);
}

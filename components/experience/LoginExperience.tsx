"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { VMark } from "@/components/ui/VMark";
import { Wordmark } from "@/components/ui/Wordmark";
import { Magnetic } from "@/components/ui/Magnetic";
import { EASE_EDITORIAL } from "@/lib/motion/easing";

export function LoginExperience() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [focused, setFocused] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!email.trim() || !password) return;
    setSubmitting(true);
    setTimeout(() => router.push("/app"), 520);
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-6 py-24">
      <motion.div
        animate={{ opacity: focused ? 0.09 : 0.05, scale: focused ? 1.03 : 1 }}
        transition={{ duration: 0.6, ease: EASE_EDITORIAL }}
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <VMark variant="cropped" size={880} tone="paper" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE_EDITORIAL }}
        className="relative flex w-full max-w-sm flex-col items-center text-center"
      >
        <div className="flex items-center gap-2.5">
          <VMark variant="solid" size={24} tone="paper" />
          <Wordmark className="text-xl text-off-white" />
        </div>
        <h1 className="mt-8 text-h2 font-medium text-off-white">Bem-vinda de volta.</h1>
        <p className="mt-2 text-[0.875rem] text-off-white/50">Entre para continuar sua marca.</p>

        <form onSubmit={handleSubmit} className="mt-10 w-full text-left">
          <div className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-[0.75rem] font-medium uppercase tracking-[0.06em] text-off-white/50"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="voce@marca.com"
                className="w-full rounded-[4px] border border-off-white/15 bg-transparent px-4 py-3 text-[0.9375rem] text-off-white outline-none transition-colors placeholder:text-off-white/30 focus:border-accent"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-[0.75rem] font-medium uppercase tracking-[0.06em] text-off-white/50"
              >
                Senha
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="••••••••"
                className="w-full rounded-[4px] border border-off-white/15 bg-transparent px-4 py-3 text-[0.9375rem] text-off-white outline-none transition-colors placeholder:text-off-white/30 focus:border-accent"
              />
            </div>
          </div>

          <Magnetic className="mt-8 block w-full">
            <button
              type="submit"
              disabled={submitting}
              data-cursor="v"
              className="w-full rounded-[4px] bg-accent py-3.5 text-[0.9375rem] font-medium text-accent-ink transition-opacity disabled:opacity-60"
            >
              {submitting ? "Entrando…" : "Entrar"}
            </button>
          </Magnetic>
        </form>

        <p className="mt-6 text-[0.75rem] text-off-white/35">
          Ambiente de demonstração — qualquer email e senha funcionam.
        </p>
      </motion.div>
    </div>
  );
}

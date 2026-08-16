"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { verifyAdminCredentials, setAdminSession } from "@/lib/auth/admin-session";
import { EASE_EDITORIAL } from "@/lib/motion/easing";

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (verifyAdminCredentials(username, password)) {
      setAdminSession();
      router.push("/admin");
    } else {
      setError("Usuário ou senha incorretos.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm">
      <div className="space-y-5">
        <div>
          <label htmlFor="username" className="mb-2 block text-[0.75rem] font-medium uppercase tracking-[0.06em] text-off-white/50">
            Email ou usuário
          </label>
          <input
            id="username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-[4px] border border-off-white/15 bg-transparent px-4 py-3 text-[0.9375rem] text-off-white outline-none transition-colors placeholder:text-off-white/30 focus:border-accent"
            placeholder="peeale12"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-2 block text-[0.75rem] font-medium uppercase tracking-[0.06em] text-off-white/50">
            Senha
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-[4px] border border-off-white/15 bg-transparent px-4 py-3 text-[0.9375rem] text-off-white outline-none transition-colors placeholder:text-off-white/30 focus:border-accent"
            placeholder="••••••••"
          />
        </div>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: EASE_EDITORIAL }}
          className="mt-4 text-[0.8125rem] text-red-400"
        >
          {error}
        </motion.p>
      )}

      <motion.button
        type="submit"
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2, ease: EASE_EDITORIAL }}
        className="mt-8 w-full rounded-[4px] bg-accent py-3.5 text-[0.9375rem] font-medium text-accent-ink"
      >
        Entrar
      </motion.button>

      <p className="mt-5 text-center text-[0.75rem] text-off-white/35">
        Acesso de demonstração — usuário <span className="text-off-white/60">peeale12</span> · senha{" "}
        <span className="text-off-white/60">veyro</span>
      </p>
    </form>
  );
}

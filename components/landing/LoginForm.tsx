"use client";

import { ArrowRight, SpinnerGap } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { buttonClass } from "@/components/ui/button";

export function LoginForm({ next, gateEnabled }: { next: string; gateEnabled: boolean }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, code }),
    }).catch(() => null);
    const data = await response?.json().catch(() => null);
    if (!response?.ok) {
      setLoading(false);
      setError(data?.error ?? "Não foi possível entrar agora.");
      return;
    }
    router.push(next);
    router.refresh();
  }

  const field =
    "mt-2 h-12 w-full rounded-xl border border-line-2 bg-ink px-4 text-[15px] outline-none placeholder:text-mute focus:border-brand";

  return (
    <form onSubmit={submit} className="space-y-5">
      <label className="block">
        <span className="text-sm font-medium">Seu nome</span>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Como você assina as mensagens"
          autoComplete="given-name"
          maxLength={40}
          required
          className={field}
        />
      </label>
      {gateEnabled && (
        <label className="block">
          <span className="text-sm font-medium">Código de acesso</span>
          <input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            type="password"
            placeholder="Código que você recebeu"
            autoComplete="current-password"
            required
            className={field}
          />
        </label>
      )}
      {error && (
        <p role="alert" className="rounded-lg border border-brand/50 bg-brand/10 px-3 py-2 text-sm">
          {error}
        </p>
      )}
      <button type="submit" disabled={loading} className={buttonClass("primary", "lg", "w-full")}>
        {loading ? <SpinnerGap size={18} className="animate-spin" /> : "Entrar"}
        {!loading && <ArrowRight size={17} weight="bold" />}
      </button>
      {!gateEnabled && (
        <p className="text-center text-xs text-mute">
          Acesso livre: nenhum código configurado em <code className="font-mono">PROSPECTA_ACCESS_CODES</code>.
        </p>
      )}
    </form>
  );
}

"use client";

import { MagnifyingGlass } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { LocationPicker } from "./LocationPicker";
import { NotificationsBell } from "./NotificationsBell";
import { UserMenu } from "./UserMenu";

export function Topbar() {
  const router = useRouter();
  const [q, setQ] = useState("");
  return (
    <header className="relative z-30 flex h-16 shrink-0 items-center gap-2 border-b border-line bg-ink/90 px-3 backdrop-blur-xl md:gap-3 md:px-6">
      <Logo href="/app" compact className="md:hidden" />
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          if (q.trim()) router.push(`/app/prospectar?q=${encodeURIComponent(q.trim())}`);
        }}
        className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-xl border border-line-2 bg-ink-3 px-3 focus-within:border-brand md:max-w-xl"
      >
        <MagnifyingGlass size={17} className="shrink-0 text-mute" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Pesquisar empresas… ex.: barbearias em Miami"
          aria-label="Pesquisar empresas"
          className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-mute"
        />
      </form>
      <LocationPicker className="hidden sm:flex" />
      <div className="ml-auto flex items-center gap-1">
        <NotificationsBell />
        <UserMenu />
      </div>
    </header>
  );
}

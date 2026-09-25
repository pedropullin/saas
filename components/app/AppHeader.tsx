"use client";

import { ChatCircleText, ListChecks, MagnifyingGlass, SignOut } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { buttonClass } from "@/components/ui/button";
import { useLeads } from "@/lib/leads";
import { cn } from "@/lib/utils";
import { useAppSession, useMyName } from "./AppSession";
import { TemplatesDialog } from "./TemplatesDialog";

const NAV = [
  { href: "/prospectar", label: "Prospectar", icon: MagnifyingGlass },
  { href: "/lista", label: "Minha lista", icon: ListChecks },
];

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { gateEnabled, demo } = useAppSession();
  const myName = useMyName();
  const leadCount = Object.keys(useLeads()).length;
  const [templatesOpen, setTemplatesOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    router.push("/entrar");
    router.refresh();
  }

  return (
    <>
      <header className="relative z-30 flex h-16 shrink-0 items-center gap-3 border-b border-line bg-ink/95 px-4 backdrop-blur md:gap-6 md:px-6">
        <Logo href="/prospectar" />
        <nav className="flex items-center gap-1" aria-label="Principal">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative inline-flex h-9 items-center gap-2 rounded-lg px-2.5 text-sm transition-colors md:px-3",
                  active ? "bg-white/[0.07] text-paper" : "text-mute hover:text-paper",
                )}
              >
                <Icon size={16} weight={active ? "bold" : "regular"} />
                <span className="hidden sm:inline">{label}</span>
                {href === "/lista" && leadCount > 0 && (
                  <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[11px] font-semibold text-white">
                    {leadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <button type="button" onClick={() => setTemplatesOpen(true)} className={buttonClass("ghost", "sm")}>
            <ChatCircleText size={16} />
            <span className="hidden md:inline">Mensagens</span>
          </button>
          {myName && (
            <span className="hidden items-center gap-2 rounded-full border border-line py-1 pl-1 pr-3 text-sm text-mute-2 sm:inline-flex">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-paper text-[11px] font-bold uppercase text-ink">
                {myName.charAt(0)}
              </span>
              {myName}
            </span>
          )}
          {gateEnabled && (
            <button type="button" onClick={logout} className={buttonClass("ghost", "icon")} aria-label="Sair">
              <SignOut size={17} />
            </button>
          )}
        </div>
      </header>
      {demo && (
        <div className="shrink-0 border-b border-brand/30 bg-brand-deep/40 px-4 py-2 text-center text-xs text-paper/90 md:px-6">
          <strong className="font-semibold text-white">Modo demonstração:</strong> empresas fictícias, contato bloqueado.
          <span className="hidden md:inline">
            {" "}
            Configure <code className="font-mono text-[11px]">GOOGLE_MAPS_API_KEY</code> para buscar empresas reais no Google
            Maps.
          </span>
        </div>
      )}
      <TemplatesDialog open={templatesOpen} onClose={() => setTemplatesOpen(false)} />
    </>
  );
}

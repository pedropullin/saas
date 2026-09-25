"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";
import { useApp } from "./AppContext";
import { isActive, MAIN_NAV, SECONDARY_NAV } from "./nav";

function NavLink({ href, label, icon: Icon, exact }: (typeof MAIN_NAV)[number]) {
  const pathname = usePathname();
  const active = isActive(pathname, href, exact);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      title={label}
      className={cn(
        "group relative flex h-10 items-center gap-3 rounded-xl px-3 text-sm transition-colors",
        active ? "bg-brand/[0.12] text-paper" : "text-mute hover:bg-white/[0.04] hover:text-paper",
      )}
    >
      {active && <span className="absolute inset-y-2 left-0 w-[3px] rounded-r bg-brand" aria-hidden="true" />}
      <Icon size={19} weight={active ? "fill" : "regular"} className={cn("shrink-0", active && "text-brand")} />
      <span className="truncate lg:inline md:hidden">{label}</span>
    </Link>
  );
}

export function Sidebar() {
  const { plan, usage } = useApp();
  const pct = Math.min(100, Math.round((usage.searches / plan.searchesPerMonth) * 100));
  return (
    <aside className="hidden w-[76px] shrink-0 flex-col border-r border-line bg-ink md:flex lg:w-[244px]">
      <div className="flex h-16 items-center px-5">
        <Logo href="/app" className="hidden lg:inline-flex" />
        <Logo href="/app" compact className="lg:hidden" />
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2" aria-label="Principal">
        {MAIN_NAV.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
        <div className="my-3 h-px bg-line" />
        {SECONDARY_NAV.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
      </nav>
      <div className="hidden p-3 lg:block">
        <Link href="/app/planos" className="block rounded-2xl border border-line bg-ink-3 p-4 transition-colors hover:border-brand/50">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold">Plano {plan.name}</span>
            <span className="text-mute tabular-nums">
              {usage.searches}/{plan.searchesPerMonth}
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
            <div className={cn("h-full rounded-full", pct >= 80 ? "bg-brand" : "bg-paper/70")} style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-2 text-[11px] text-mute">Pesquisas usadas este mês</p>
        </Link>
      </div>
    </aside>
  );
}

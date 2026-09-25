"use client";

import { DotsThreeOutline, SignOut } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Sheet } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import { signOutAction } from "@/server/auth/actions";
import { isActive, MAIN_NAV, SECONDARY_NAV } from "./nav";

const PRIMARY = MAIN_NAV.filter((item) => ["/app", "/app/prospectar", "/app/mapa", "/app/leads"].includes(item.href));
const MORE = [...MAIN_NAV.filter((item) => !PRIMARY.includes(item)), ...SECONDARY_NAV];

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const moreActive = MORE.some((item) => isActive(pathname, item.href));

  return (
    <>
      <nav
        aria-label="Navegação"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-line bg-ink/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
      >
        {PRIMARY.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(pathname, href, exact);
          return (
            <Link key={href} href={href} aria-current={active ? "page" : undefined} className={cn("flex h-16 flex-col items-center justify-center gap-1 text-[11px]", active ? "text-paper" : "text-mute")}>
              <Icon size={22} weight={active ? "fill" : "regular"} className={active ? "text-brand" : ""} />
              {label === "Dashboard" ? "Início" : label}
            </Link>
          );
        })}
        <button type="button" onClick={() => setOpen(true)} className={cn("flex h-16 flex-col items-center justify-center gap-1 text-[11px]", moreActive ? "text-paper" : "text-mute")}>
          <DotsThreeOutline size={22} weight={moreActive ? "fill" : "regular"} className={moreActive ? "text-brand" : ""} />
          Mais
        </button>
      </nav>
      <Sheet open={open} onClose={() => setOpen(false)} title="Menu">
        <div className="grid grid-cols-2 gap-2 p-4">
          {MORE.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn("flex items-center gap-3 rounded-2xl border px-4 py-4 text-sm", isActive(pathname, href) ? "border-brand/50 bg-brand/10" : "border-line bg-ink-3")}
            >
              <Icon size={20} className="text-brand" /> {label}
            </Link>
          ))}
          <form action={signOutAction} className="col-span-2">
            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-2xl border border-line px-4 py-4 text-sm text-mute">
              <SignOut size={18} /> Sair
            </button>
          </form>
        </div>
      </Sheet>
    </>
  );
}

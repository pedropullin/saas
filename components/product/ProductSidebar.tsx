"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react";
import { VMark } from "@/components/ui/VMark";
import { Wordmark } from "@/components/ui/Wordmark";
import { NavIcon } from "@/components/ui/nav-icon";
import { PRODUCT_NAV } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function ProductSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-ink/8 bg-off-white px-5 py-6 md:flex">
      <Link href="/" className="flex items-center gap-2.5 px-2">
        <VMark variant="solid" size={20} tone="ink" />
        <Wordmark className="text-[1.0625rem]" />
      </Link>

      <nav className="mt-10 flex-1 space-y-1">
        {PRODUCT_NAV.map((item) => {
          const isActive =
            item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-[4px] px-3 py-2.5 text-[0.875rem] font-medium transition-colors",
                isActive ? "bg-ink text-off-white" : "text-neutral-600 hover:bg-ink/5 hover:text-ink"
              )}
            >
              <NavIcon name={item.icon} size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3 border-t border-ink/8 pt-5">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-[0.8125rem] font-medium text-neutral-500 transition-colors hover:text-ink"
        >
          <ArrowLeft size={14} weight="regular" />
          Voltar ao site
        </Link>
        <div className="flex items-center gap-2.5 rounded-[4px] bg-paper p-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-[0.75rem] font-semibold text-accent-ink">
            MC
          </div>
          <div className="min-w-0">
            <p className="truncate text-[0.8125rem] font-medium text-ink">Marina Costa</p>
            <p className="truncate text-[0.6875rem] text-neutral-500">Plano Business</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

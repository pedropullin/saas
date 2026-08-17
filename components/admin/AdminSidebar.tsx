"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SignOut } from "@phosphor-icons/react";
import { Wordmark } from "@/components/ui/Wordmark";
import { VMark } from "@/components/ui/VMark";
import { NavIcon } from "@/components/ui/nav-icon";
import { ADMIN_NAV } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { clearAdminSession } from "@/lib/auth/admin-session";

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-ink/8 bg-ink px-5 py-6 text-off-white md:flex">
      <div className="flex items-center gap-2.5 px-2">
        <VMark variant="solid" size={20} tone="paper" />
        <Wordmark className="text-[1.0625rem] text-off-white" />
        <span className="ml-1 text-[0.6875rem] font-medium uppercase tracking-[0.06em] text-off-white/40">
          Admin
        </span>
      </div>

      <nav className="mt-10 flex-1 space-y-0.5 overflow-y-auto">
        {ADMIN_NAV.map((item) => {
          const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-[4px] px-3 py-2.5 text-[0.8125rem] font-medium transition-colors",
                isActive ? "bg-off-white text-ink" : "text-off-white/60 hover:bg-off-white/10 hover:text-off-white"
              )}
            >
              <NavIcon name={item.icon} size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={() => {
          clearAdminSession();
          router.push("/admin/login");
        }}
        className="mt-auto flex items-center gap-2 border-t border-off-white/10 pt-5 text-left text-[0.8125rem] font-medium text-off-white/50 transition-colors hover:text-off-white"
      >
        <SignOut size={15} weight="regular" />
        Sair
      </button>
    </aside>
  );
}

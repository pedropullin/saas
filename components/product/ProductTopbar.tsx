"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { VMark } from "@/components/ui/VMark";
import { Wordmark } from "@/components/ui/Wordmark";
import { PRODUCT_NAV } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function ProductTopbar() {
  const pathname = usePathname();

  return (
    <div className="sticky top-0 z-40 border-b border-ink/8 bg-off-white/95 backdrop-blur md:hidden">
      <div className="flex items-center gap-2.5 px-5 py-4">
        <VMark variant="solid" size={18} tone="ink" />
        <Wordmark className="text-[0.9375rem]" />
      </div>
      <nav className="no-scrollbar flex gap-1 overflow-x-auto px-5 pb-3">
        {PRODUCT_NAV.map((item) => {
          const isActive =
            item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1.5 text-[0.8125rem] font-medium transition-colors",
                isActive ? "bg-ink text-off-white" : "text-neutral-500"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

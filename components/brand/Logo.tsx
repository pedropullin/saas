import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("h-7 w-7", className)}>
      <path
        d="M16 3C9.9 3 5 7.8 5 13.7 5 22 16 29 16 29s11-7 11-15.3C27 7.8 22.1 3 16 3Z"
        fill="var(--color-brand)"
      />
      <circle cx="16" cy="13.6" r="4.3" fill="var(--color-ink)" />
      <circle cx="16" cy="13.6" r="1.6" fill="var(--color-paper)" />
    </svg>
  );
}

export function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-2", className)} aria-label="Prospecta.ai — início">
      <LogoMark className="transition-transform duration-300 group-hover:-translate-y-0.5" />
      <span className="text-[17px] font-semibold tracking-tight">
        prospecta<span className="text-brand">.ai</span>
      </span>
    </Link>
  );
}

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("w-full overflow-x-auto rounded-md border border-ink/8 bg-paper", className)}>
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">{children}</table>
    </div>
  );
}

export function TableHead({ children }: { children: ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-ink/8">{children}</tr>
    </thead>
  );
}

export function TableHeadCell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        "px-5 py-3 text-label font-medium uppercase tracking-[0.06em] text-neutral-500",
        className
      )}
    >
      {children}
    </th>
  );
}

export function TableBody({ children }: { children: ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function TableRow({
  children,
  className,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <tr
      onClick={onClick}
      className={cn("border-b border-ink/6 last:border-0 hover:bg-off-white/60 transition-colors", className)}
    >
      {children}
    </tr>
  );
}

export function TableCell({
  children,
  className,
  colSpan,
}: {
  children: ReactNode;
  className?: string;
  colSpan?: number;
}) {
  return (
    <td colSpan={colSpan} className={cn("px-5 py-4 align-middle text-ink", className)}>
      {children}
    </td>
  );
}

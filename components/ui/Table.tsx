import type { ReactNode, HTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** shadcn/ui's Table primitives — semantic table elements, VEYRO borders/type. */

export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("w-full overflow-x-auto rounded-md border border-ink/8 bg-paper", className)}>
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">{children}</table>
    </div>
  );
}

export function TableHeader({ children, className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={cn("border-b border-ink/8", className)} {...props}>
      <tr>{children}</tr>
    </thead>
  );
}

export function TableHead({ children, className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "px-5 py-3 text-label font-medium uppercase tracking-[0.06em] text-neutral-500",
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableBody({ children, className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={className} {...props}>
      {children}
    </tbody>
  );
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
      className={cn("border-b border-ink/6 transition-colors last:border-0 hover:bg-off-white/60", className)}
    >
      {children}
    </tr>
  );
}

export function TableCell({ children, className, colSpan }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td colSpan={colSpan} className={cn("px-5 py-4 align-middle text-ink", className)}>
      {children}
    </td>
  );
}

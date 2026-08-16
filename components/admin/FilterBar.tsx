import type { ReactNode } from "react";

export function FilterBar({
  search,
  onSearchChange,
  placeholder = "Buscar...",
  children,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={placeholder}
        className="w-full max-w-xs rounded-[4px] border border-ink/10 bg-paper px-3.5 py-2.5 text-[0.875rem] text-ink outline-none transition-colors placeholder:text-neutral-400 focus:border-ink/30"
      />
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

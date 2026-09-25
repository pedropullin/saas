"use client";

import { Check } from "@phosphor-icons/react";
import { activeFilterCount, DEFAULT_FILTERS, type ClientFilters, type SortKey } from "@/lib/filters";
import { cn } from "@/lib/utils";

function Toggle({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium transition-colors",
        active ? "border-brand bg-brand text-white" : "border-line-2 text-mute-2 hover:border-mute hover:text-paper",
      )}
    >
      {active && <Check size={13} weight="bold" />}
      {children}
    </button>
  );
}

function SelectChip<T extends string | number>({
  value,
  options,
  onChange,
  label,
  isDefault,
}: {
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
  label: string;
  isDefault: boolean;
}) {
  return (
    <select
      value={String(value)}
      aria-label={label}
      onChange={(event) => {
        const found = options.find((option) => String(option.value) === event.target.value);
        if (found) onChange(found.value);
      }}
      className={cn(
        "h-8 shrink-0 cursor-pointer appearance-none rounded-full border bg-transparent px-3 text-[13px] font-medium outline-none transition-colors",
        isDefault ? "border-line-2 text-mute-2 hover:border-mute hover:text-paper" : "border-brand bg-brand text-white",
      )}
    >
      {options.map((option) => (
        <option key={String(option.value)} value={String(option.value)} className="bg-ink text-paper">
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function FilterBar({
  filters,
  onChange,
  sort,
  onSort,
}: {
  filters: ClientFilters;
  onChange: (filters: ClientFilters) => void;
  sort: SortKey;
  onSort: (sort: SortKey) => void;
}) {
  const set = (patch: Partial<ClientFilters>) => onChange({ ...filters, ...patch });
  const count = activeFilterCount(filters);

  return (
    <div className="flex items-center gap-2 overflow-x-auto px-4 py-3 [scrollbar-width:none] md:px-5">
      <Toggle active={filters.onlyWhatsApp} onClick={() => set({ onlyWhatsApp: !filters.onlyWhatsApp })}>
        Com WhatsApp
      </Toggle>
      <SelectChip
        label="Site"
        value={filters.website}
        isDefault={filters.website === "todos"}
        onChange={(website) => set({ website })}
        options={[
          { value: "todos", label: "Site: todos" },
          { value: "sem", label: "Sem site" },
          { value: "com", label: "Com site" },
        ]}
      />
      <SelectChip
        label="Nota mínima"
        value={filters.minRating}
        isDefault={filters.minRating === 0}
        onChange={(minRating) => set({ minRating })}
        options={[
          { value: 0, label: "Qualquer nota" },
          { value: 3.5, label: "Nota 3,5+" },
          { value: 4, label: "Nota 4,0+" },
          { value: 4.5, label: "Nota 4,5+" },
        ]}
      />
      <SelectChip
        label="Mínimo de avaliações"
        value={filters.minReviews}
        isDefault={filters.minReviews === 0}
        onChange={(minReviews) => set({ minReviews })}
        options={[
          { value: 0, label: "Avaliações: todas" },
          { value: 10, label: "10+ avaliações" },
          { value: 50, label: "50+ avaliações" },
          { value: 100, label: "100+ avaliações" },
          { value: 500, label: "500+ avaliações" },
        ]}
      />
      <Toggle active={filters.openNow} onClick={() => set({ openNow: !filters.openNow })}>
        Aberto agora
      </Toggle>
      <Toggle active={filters.onlyWithPhone} onClick={() => set({ onlyWithPhone: !filters.onlyWithPhone })}>
        Com telefone
      </Toggle>
      <span className="mx-1 h-5 w-px shrink-0 bg-line-2" aria-hidden="true" />
      <SelectChip
        label="Ordenar por"
        value={sort}
        isDefault
        onChange={onSort}
        options={[
          { value: "relevancia", label: "Ordem: relevância" },
          { value: "nota", label: "Ordem: maior nota" },
          { value: "avaliacoes", label: "Ordem: mais avaliações" },
          { value: "nome", label: "Ordem: nome A–Z" },
        ]}
      />
      {count > 0 && (
        <button
          type="button"
          onClick={() => onChange(DEFAULT_FILTERS)}
          className="h-8 shrink-0 px-2 text-[13px] text-mute underline-offset-4 hover:text-paper hover:underline"
        >
          Limpar ({count})
        </button>
      )}
    </div>
  );
}

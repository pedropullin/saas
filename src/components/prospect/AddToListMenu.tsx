"use client";

import { Check, ListPlus, Plus, SpinnerGap } from "@phosphor-icons/react";
import { useState } from "react";
import { addToList, createListWith } from "@/client/company-actions";
import { buttonClass, type ButtonSize } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { Popover } from "@/components/ui/Popover";
import type { Place, ResultPlace } from "@/lib/types";
import { cn } from "@/lib/utils";
import { listListsAction } from "@/server/lists/actions";

export function AddToListMenu({
  places,
  size = "sm",
  label = "Lista",
  variant = "outline",
  className,
  align = "end",
}: {
  places: Array<Place | ResultPlace>;
  size?: ButtonSize;
  label?: string | null;
  variant?: "outline" | "ghost" | "subtle";
  className?: string;
  align?: "start" | "end";
}) {
  const [lists, setLists] = useState<Array<{ id: string; name: string; count: number }> | null>(null);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const inLists = new Set(places.length === 1 && "saved" in places[0]! ? (places[0] as ResultPlace).saved.listIds : []);

  return (
    <Popover
      align={align}
      className="w-[280px]"
      onOpenChange={async (open) => {
        if (open) {
          const result = await listListsAction();
          setLists(result.ok ? result.data : []);
        }
      }}
      trigger={({ toggle, open }) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggle();
          }}
          aria-expanded={open}
          className={buttonClass(variant, size, className)}
          title="Adicionar à lista"
        >
          <ListPlus size={16} />
          {label && <span>{label}</span>}
        </button>
      )}
    >
      {(close) => (
        <div onClick={(e) => e.stopPropagation()}>
          <p className="border-b border-line px-4 py-3 text-sm font-semibold">
            Adicionar {places.length > 1 ? `${places.length} empresas` : "à lista"}
          </p>
          <div className="max-h-56 overflow-y-auto p-1.5">
            {lists === null && <p className="px-3 py-3 text-sm text-mute">Carregando listas…</p>}
            {lists?.length === 0 && <p className="px-3 py-3 text-sm text-mute">Você ainda não tem listas.</p>}
            {lists?.map((list) => (
              <button
                key={list.id}
                type="button"
                disabled={busy !== null}
                onClick={async () => {
                  setBusy(list.id);
                  const ok = await addToList(list.id, list.name, places);
                  setBusy(null);
                  if (ok) close();
                }}
                className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-white/[0.05]"
              >
                <span className="truncate">{list.name}</span>
                <span className="flex items-center gap-2 text-xs text-mute">
                  {busy === list.id ? <SpinnerGap size={14} className="animate-spin" /> : inLists.has(list.id) ? <Check size={14} className="text-brand" /> : list.count}
                </span>
              </button>
            ))}
          </div>
          <form
            className="flex gap-2 border-t border-line p-3"
            onSubmit={async (event) => {
              event.preventDefault();
              if (!name.trim()) return;
              setBusy("new");
              const created = await createListWith(name.trim(), places);
              setBusy(null);
              if (created) {
                setName("");
                close();
              }
            }}
          >
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nova lista" className="h-9" aria-label="Nome da nova lista" />
            <button type="submit" disabled={busy !== null || !name.trim()} className={cn(buttonClass("primary", "icon-sm"), "h-9 w-9")} aria-label="Criar lista">
              {busy === "new" ? <SpinnerGap size={14} className="animate-spin" /> : <Plus size={15} weight="bold" />}
            </button>
          </form>
        </div>
      )}
    </Popover>
  );
}

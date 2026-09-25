"use client";

import { ArrowLeft, MagnifyingGlass, PencilSimple } from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "@/client/toast";
import { buttonClass } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { EmptyState } from "@/components/ui/misc";
import { removeFromListAction, updateListAction } from "@/server/lists/actions";
import { CompanyTable, type CompanyItem } from "./CompanyTable";

export function ListDetail({ list, items }: { list: { id: string; name: string; description: string | null }; items: CompanyItem[] }) {
  const [name, setName] = useState(list.name);
  const [editing, setEditing] = useState(false);
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-8">
      <Link href="/app/listas" className="inline-flex items-center gap-1.5 text-sm text-mute hover:text-paper">
        <ArrowLeft size={15} /> Listas
      </Link>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">Lista</p>
          {editing ? (
            <form
              className="mt-2 flex gap-2"
              onSubmit={async (e) => {
                e.preventDefault();
                const result = await updateListAction(list.id, { name });
                if (!result.ok) return toast.error(result.error);
                setEditing(false);
              }}
            >
              <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} autoFocus className="h-11 text-lg" />
              <button type="submit" className={buttonClass("primary", "md")}>
                Salvar
              </button>
            </form>
          ) : (
            <h1 className="mt-1.5 flex items-center gap-2 text-2xl font-semibold tracking-tight md:text-3xl">
              {name}
              <button type="button" onClick={() => setEditing(true)} className="text-mute hover:text-paper" aria-label="Renomear lista">
                <PencilSimple size={18} />
              </button>
            </h1>
          )}
          <p className="mt-1.5 text-sm text-mute">
            {items.length} empresas{list.description ? ` · ${list.description}` : ""}
          </p>
        </div>
        <Link href="/app/prospectar" className={buttonClass("outline", "sm")}>
          <MagnifyingGlass size={15} /> Adicionar empresas pela busca
        </Link>
      </div>
      {items.length === 0 ? (
        <EmptyState title="Lista vazia" description="Nos resultados da busca, use “Lista” em cada empresa ou selecione várias e adicione de uma vez." />
      ) : (
        <CompanyTable
          items={items}
          filename={`lista-${name.toLowerCase().normalize("NFD").replace(/[^\w]+/g, "-")}`}
          onRemove={async (ids) => {
            const result = await removeFromListAction(list.id, ids);
            if (!result.ok) toast.error(result.error);
            return result.ok;
          }}
        />
      )}
    </div>
  );
}

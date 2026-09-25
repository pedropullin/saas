"use client";

import { ListBullets, Plus, SpinnerGap, Trash } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "@/client/toast";
import { buttonClass } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/form";
import { Modal } from "@/components/ui/Modal";
import { EmptyState, PageHeader } from "@/components/ui/misc";
import { createListAction, deleteListAction } from "@/server/lists/actions";

interface ListSummary {
  id: string;
  name: string;
  description: string | null;
  count: number;
  updatedAt: string;
  createdByName: string | null;
}

const SUGGESTIONS = ["Restaurantes Curitiba", "Empresas sem site", "Clientes potenciais", "Arquitetos", "Prospects São Paulo"];

export function ListsIndex({ lists: initial, maxLists }: { lists: ListSummary[]; maxLists: number }) {
  const router = useRouter();
  const [lists, setLists] = useState(initial);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  async function create(listName = name) {
    setBusy(true);
    const result = await createListAction(listName, description || null);
    setBusy(false);
    if (!result.ok) return toast.error(result.error);
    toast.success(`Lista “${result.data.name}” criada.`);
    router.push(`/app/listas/${result.data.id}`);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-8">
      <PageHeader
        eyebrow="Organização"
        title="Listas"
        description={`Agrupe empresas por segmento, região ou campanha. ${lists.length}/${maxLists >= 1000 ? "∞" : maxLists} listas.`}
        actions={
          <button type="button" onClick={() => setOpen(true)} className={buttonClass("primary", "sm")}>
            <Plus size={15} weight="bold" /> Nova lista
          </button>
        }
      />
      {lists.length === 0 ? (
        <EmptyState
          icon={<ListBullets size={22} />}
          title="Crie sua primeira lista"
          description="Salve empresas direto dos resultados em listas como estas:"
          action={
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" disabled={busy} onClick={() => create(s)} className="rounded-full border border-line-2 px-3 py-1.5 text-sm text-mute-2 hover:border-brand hover:text-paper">
                  + {s}
                </button>
              ))}
            </div>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {lists.map((list) => (
            <div key={list.id} className="group relative rounded-2xl border border-line bg-ink-3 p-5 transition-colors hover:border-brand/50">
              <Link href={`/app/listas/${list.id}`} className="absolute inset-0 rounded-2xl" aria-label={`Abrir ${list.name}`} />
              <div className="flex items-start justify-between gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand/10 text-brand">
                  <ListBullets size={20} />
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    if (!confirm(`Excluir a lista “${list.name}”? As empresas continuam salvas nos leads e favoritos.`)) return;
                    const result = await deleteListAction(list.id);
                    if (!result.ok) return toast.error(result.error);
                    setLists((all) => all.filter((l) => l.id !== list.id));
                  }}
                  className="relative z-10 grid h-8 w-8 place-items-center rounded-lg text-mute opacity-0 transition-opacity hover:bg-white/5 hover:text-paper group-hover:opacity-100 focus:opacity-100"
                  aria-label={`Excluir ${list.name}`}
                >
                  <Trash size={15} />
                </button>
              </div>
              <h2 className="mt-4 truncate text-lg font-semibold tracking-tight">{list.name}</h2>
              <p className="mt-1 line-clamp-2 min-h-[2.5em] text-sm text-mute">{list.description ?? "Sem descrição"}</p>
              <p className="mt-4 text-xs text-mute">
                <b className="text-paper">{list.count}</b> empresas · {list.createdByName ?? "—"} · {new Date(list.updatedAt).toLocaleDateString("pt-BR")}
              </p>
            </div>
          ))}
        </div>
      )}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Nova lista"
        footer={
          <button type="button" disabled={!name.trim() || busy} onClick={() => create()} className={buttonClass("primary", "md")}>
            {busy && <SpinnerGap size={15} className="animate-spin" />} Criar lista
          </button>
        }
      >
        <div className="space-y-4 p-5 md:p-6">
          <Field label="Nome">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Restaurantes Curitiba" maxLength={80} autoFocus />
          </Field>
          <Field label="Descrição (opcional)">
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} maxLength={300} />
          </Field>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s) => (
              <button key={s} type="button" onClick={() => setName(s)} className="rounded-full border border-line-2 px-2.5 py-1 text-xs text-mute-2 hover:text-paper">
                {s}
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}

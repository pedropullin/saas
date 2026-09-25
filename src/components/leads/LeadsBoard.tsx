"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { DownloadSimple, Kanban, MagnifyingGlass, Phone, Plus, Rows, Star, Trash, UploadSimple, WhatsappLogo } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { toast } from "@/client/toast";
import { useApp } from "@/components/shell/AppContext";
import { buttonClass } from "@/components/ui/button";
import { Checkbox, Select } from "@/components/ui/form";
import { Avatar, Chip, DemoBadge, EmptyState, PageHeader } from "@/components/ui/misc";
import { LEAD_STATUSES, STATUS_LABEL, type LeadStatus, type LeadView } from "@/lib/leads";
import { cn, formatDate, formatRating } from "@/lib/utils";
import { deleteLeadsAction, moveLeadsAction } from "@/server/leads/actions";
import { ImportDialog } from "./ImportDialog";
import { LeadDrawer } from "./LeadDrawer";

interface Member {
  userId: string;
  name: string;
  avatarUrl: string | null;
}

function LeadCard({ lead, onOpen, dragging, overlay }: { lead: LeadView; onOpen?: () => void; dragging?: boolean; overlay?: boolean }) {
  return (
    <div
      onClick={onOpen}
      className={cn(
        "cursor-grab rounded-xl border border-line bg-ink-2 p-3 text-left transition-colors hover:border-line-2 active:cursor-grabbing",
        dragging && "opacity-40",
        overlay && "rotate-2 border-brand/60 shadow-glow",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="line-clamp-2 text-sm font-semibold leading-snug">{lead.companyName}</p>
        {lead.demo && <DemoBadge />}
      </div>
      <p className="mt-0.5 truncate text-xs text-mute">{[lead.category, lead.city].filter(Boolean).join(" · ") || "—"}</p>
      <div className="mt-2 flex items-center gap-2 text-xs text-mute">
        {lead.rating != null && (
          <span className="inline-flex items-center gap-0.5 text-mute-2">
            <Star size={11} weight="fill" className="text-brand" /> {formatRating(lead.rating)}
          </span>
        )}
        {lead.whatsapp && <WhatsappLogo size={13} weight="fill" className="text-brand" aria-label="Tem WhatsApp" />}
        {lead.phone && <Phone size={12} aria-label="Tem telefone" />}
        {!lead.website && <span className="rounded bg-brand/15 px-1 text-[10px] font-semibold text-[#ff4d55]">SEM SITE</span>}
        <span className="ml-auto">{lead.lastContactAt ? formatDate(lead.lastContactAt) : ""}</span>
      </div>
      {(lead.tags.length > 0 || lead.assignedName) && (
        <div className="mt-2 flex items-center gap-1">
          {lead.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="truncate rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-mute-2">
              {tag}
            </span>
          ))}
          {lead.assignedName && (
            <span className="ml-auto" title={`Responsável: ${lead.assignedName}`}>
              <Avatar name={lead.assignedName} size={20} />
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function DraggableLead({ lead, onOpen }: { lead: LeadView; onOpen: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: lead.id, data: { status: lead.status } });
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} aria-label={`${lead.companyName}, ${STATUS_LABEL[lead.status]}. Arraste para mudar de etapa.`}>
      <LeadCard lead={lead} onOpen={onOpen} dragging={isDragging} />
    </div>
  );
}

function Column({ status, label, leads, onOpen }: { status: LeadStatus; label: string; leads: LeadView[]; onOpen: (id: string) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <section
      ref={setNodeRef}
      aria-label={label}
      className={cn("flex w-[280px] shrink-0 snap-start flex-col rounded-2xl border bg-ink-3 transition-colors", isOver ? "border-brand/70 bg-brand/[0.05]" : "border-line")}
    >
      <header className="flex items-center justify-between px-3.5 py-3">
        <h2 className="text-sm font-semibold">{label}</h2>
        <span className={cn("rounded-full px-2 text-xs tabular-nums", status === "cliente" ? "bg-brand text-white" : "bg-white/[0.07] text-mute-2")}>{leads.length}</span>
      </header>
      <div className="flex min-h-[120px] flex-1 flex-col gap-2 overflow-y-auto px-2.5 pb-3">
        {leads.map((lead) => (
          <DraggableLead key={lead.id} lead={lead} onOpen={() => onOpen(lead.id)} />
        ))}
        {!leads.length && <p className="rounded-xl border border-dashed border-line px-3 py-6 text-center text-xs text-mute">Arraste leads para cá</p>}
      </div>
    </section>
  );
}

export function LeadsBoard({ initialLeads, members, canExport }: { initialLeads: LeadView[]; members: Member[]; canExport: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const { user } = useApp();
  const [leads, setLeads] = useState(initialLeads);
  const [view, setView] = useState<"kanban" | "tabela">("kanban");
  const [query, setQuery] = useState("");
  const [owner, setOwner] = useState("todos");
  const [openId, setOpenId] = useState<string | null>(params.get("lead"));
  const [importOpen, setImportOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selection, setSelection] = useState<Set<string>>(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor),
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter((lead) => {
      if (owner === "meus" && lead.assignedTo !== user.id) return false;
      if (owner !== "todos" && owner !== "meus" && lead.assignedTo !== owner) return false;
      if (!q) return true;
      return [lead.companyName, lead.contactName, lead.city, lead.category, lead.notes, ...lead.tags].some((v) => v?.toLowerCase().includes(q));
    });
  }, [leads, query, owner, user.id]);

  const patchLead = useCallback((patch: Partial<LeadView> & { id: string }) => {
    setLeads((all) => all.map((l) => (l.id === patch.id ? { ...l, ...patch } : l)));
  }, []);
  const closeDrawer = useCallback(() => {
    setOpenId(null);
    if (params.get("lead")) router.replace("/app/leads", { scroll: false });
  }, [params, router]);

  async function move(ids: string[], status: LeadStatus) {
    const before = leads;
    setLeads((all) => all.map((l) => (ids.includes(l.id) ? { ...l, status, updatedAt: new Date().toISOString() } : l)));
    const result = await moveLeadsAction(ids, status);
    if (!result.ok) {
      setLeads(before);
      toast.error(result.error);
    } else toast.success(ids.length === 1 ? `Movido para ${STATUS_LABEL[status]}.` : `${ids.length} leads movidos para ${STATUS_LABEL[status]}.`);
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const status = event.over?.id as LeadStatus | undefined;
    const from = event.active.data.current?.status as LeadStatus | undefined;
    if (status && status !== from) void move([String(event.active.id)], status);
  }

  const exportHref = `/api/export/leads${selection.size ? `?ids=${[...selection].join(",")}` : ""}`;
  const active = activeId ? leads.find((l) => l.id === activeId) : null;

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 space-y-4 px-4 pb-4 pt-6 md:px-8">
        <PageHeader
          eyebrow="CRM"
          title="Leads"
          description={`${leads.length} leads · arraste entre as etapas para atualizar o funil.`}
          actions={
            <>
              <button type="button" onClick={() => setImportOpen(true)} className={buttonClass("outline", "sm")}>
                <UploadSimple size={15} /> Importar
              </button>
              {canExport ? (
                <a href={exportHref} className={buttonClass("outline", "sm")}>
                  <DownloadSimple size={15} /> Exportar {selection.size ? `(${selection.size})` : "CSV"}
                </a>
              ) : (
                <Link href="/app/planos" className={buttonClass("outline", "sm")} title="Exportação no plano Pro">
                  <DownloadSimple size={15} /> Exportar (Pro)
                </Link>
              )}
              <Link href="/app/prospectar" className={buttonClass("primary", "sm")}>
                <Plus size={15} weight="bold" /> Encontrar empresas
              </Link>
            </>
          }
        />
        <div className="flex flex-wrap items-center gap-2">
          <div className="grid grid-cols-2 rounded-xl border border-line-2 bg-ink-2 p-1">
            {(
              [
                ["kanban", "Quadro", Kanban],
                ["tabela", "Tabela", Rows],
              ] as const
            ).map(([id, label, Icon]) => (
              <button key={id} type="button" onClick={() => setView(id)} aria-pressed={view === id} className={cn("inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-[13px]", view === id ? "bg-paper text-ink" : "text-mute-2")}>
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>
          <label className="flex h-10 min-w-[200px] flex-1 items-center gap-2 rounded-xl border border-line-2 bg-ink-2 px-3 focus-within:border-brand md:max-w-sm">
            <MagnifyingGlass size={16} className="text-mute" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por empresa, cidade, tag…" className="h-full flex-1 bg-transparent text-sm outline-none placeholder:text-mute" />
          </label>
          <Select value={owner} onChange={(e) => setOwner(e.target.value)} className="w-auto" aria-label="Responsável">
            <option value="todos">Todos os responsáveis</option>
            <option value="meus">Meus leads</option>
            {members
              .filter((m) => m.userId !== user.id)
              .map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.name}
                </option>
              ))}
          </Select>
        </div>
      </div>

      {leads.length === 0 ? (
        <div className="px-4 md:px-8">
          <EmptyState
            icon={<Kanban size={22} />}
            title="Nenhum lead ainda"
            description="Pesquise empresas e clique em “Adicionar aos leads”, ou importe uma planilha que você já tem."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Link href="/app/prospectar" className={buttonClass("primary", "md")}>
                  Encontrar empresas
                </Link>
                <button type="button" onClick={() => setImportOpen(true)} className={buttonClass("outline", "md")}>
                  Importar CSV
                </button>
              </div>
            }
          />
        </div>
      ) : view === "kanban" ? (
        <DndContext sensors={sensors} collisionDetection={pointerWithin} onDragStart={(e: DragStartEvent) => setActiveId(String(e.active.id))} onDragEnd={onDragEnd} onDragCancel={() => setActiveId(null)}>
          <div className="flex min-h-0 flex-1 snap-x gap-3 overflow-x-auto px-4 pb-6 md:px-8">
            {LEAD_STATUSES.map((s) => (
              <Column key={s.id} status={s.id} label={s.label} leads={filtered.filter((l) => l.status === s.id)} onOpen={setOpenId} />
            ))}
          </div>
          <DragOverlay>{active ? <LeadCard lead={active} overlay /> : null}</DragOverlay>
        </DndContext>
      ) : (
        <div className="min-h-0 flex-1 overflow-auto px-4 pb-8 md:px-8">
          {selection.size > 0 && (
            <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-brand/30 bg-brand/[0.07] px-3 py-2">
              <span className="text-sm font-medium">{selection.size} selecionados</span>
              <Select defaultValue="" onChange={(e) => e.target.value && void move([...selection], e.target.value as LeadStatus).then(() => setSelection(new Set()))} className="h-8 w-auto text-xs" aria-label="Mover para">
                <option value="">Mover para…</option>
                {LEAD_STATUSES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </Select>
              <button
                type="button"
                onClick={async () => {
                  if (!confirm(`Excluir ${selection.size} leads?`)) return;
                  const ids = [...selection];
                  const result = await deleteLeadsAction(ids);
                  if (!result.ok) return toast.error(result.error);
                  setLeads((all) => all.filter((l) => !ids.includes(l.id)));
                  setSelection(new Set());
                  toast.success("Leads excluídos.");
                }}
                className={buttonClass("ghost", "sm")}
              >
                <Trash size={15} /> Excluir
              </button>
            </div>
          )}
          <div className="overflow-hidden rounded-2xl border border-line">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-ink-3 text-xs text-mute">
                <tr>
                  <th className="w-10 px-3 py-3">
                    <Checkbox checked={filtered.length > 0 && filtered.every((l) => selection.has(l.id))} onChange={(c) => setSelection(c ? new Set(filtered.map((l) => l.id)) : new Set())} label={<span className="sr-only">Selecionar todos</span>} />
                  </th>
                  <th className="px-3 py-3 font-medium">Empresa</th>
                  <th className="px-3 py-3 font-medium">Contato</th>
                  <th className="px-3 py-3 font-medium">Telefone / WhatsApp</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium">Responsável</th>
                  <th className="px-3 py-3 font-medium">Último contato</th>
                  <th className="px-3 py-3 font-medium">Tags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((lead) => (
                  <tr key={lead.id} className="bg-ink-2 hover:bg-ink-3">
                    <td className="px-3 py-3">
                      <Checkbox
                        checked={selection.has(lead.id)}
                        onChange={(c) =>
                          setSelection((s) => {
                            const next = new Set(s);
                            if (c) next.add(lead.id);
                            else next.delete(lead.id);
                            return next;
                          })
                        }
                        label={<span className="sr-only">Selecionar {lead.companyName}</span>}
                      />
                    </td>
                    <td className="px-3 py-3">
                      <button type="button" onClick={() => setOpenId(lead.id)} className="text-left font-medium hover:text-brand">
                        {lead.companyName}
                      </button>
                      <p className="text-xs text-mute">{[lead.category, lead.city].filter(Boolean).join(" · ")}</p>
                    </td>
                    <td className="px-3 py-3 text-mute-2">{lead.contactName ?? <span className="text-mute">Não encontrado</span>}</td>
                    <td className="px-3 py-3 text-mute-2">
                      <p>{lead.phone ?? <span className="text-mute">Não encontrado</span>}</p>
                      {lead.whatsapp && <p className="text-xs text-mute">WA {lead.whatsapp}</p>}
                    </td>
                    <td className="px-3 py-3">
                      <Select value={lead.status} onChange={(e) => void move([lead.id], e.target.value as LeadStatus)} className="h-8 w-40 text-xs" aria-label="Status">
                        {LEAD_STATUSES.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.label}
                          </option>
                        ))}
                      </Select>
                    </td>
                    <td className="px-3 py-3 text-mute-2">{lead.assignedName ?? "—"}</td>
                    <td className="px-3 py-3 text-mute-2">{formatDate(lead.lastContactAt)}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-1">
                        {lead.tags.map((tag) => (
                          <Chip key={tag} tone="dim">
                            {tag}
                          </Chip>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <LeadDrawer
        leadId={openId}
        members={members}
        onClose={closeDrawer}
        onChange={patchLead}
        onDelete={(id) => setLeads((all) => all.filter((l) => l.id !== id))}
      />
      <ImportDialog open={importOpen} onClose={() => setImportOpen(false)} />
    </div>
  );
}

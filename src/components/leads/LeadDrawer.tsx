"use client";

import { ArrowUpRight, ChatText, Phone, PhoneCall, SpinnerGap, Trash, WhatsappLogo } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "@/client/toast";
import { useApp } from "@/components/shell/AppContext";
import { buttonClass } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { Sheet } from "@/components/ui/Modal";
import { DemoBadge, Skeleton } from "@/components/ui/misc";
import { LEAD_STATUSES, STATUS_LABEL, type LeadStatus, type LeadView } from "@/lib/leads";
import type { Place } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";
import { fillTemplate } from "@/lib/whatsapp";
import { addNoteAction, deleteLeadsAction, getLeadAction, moveLeadsAction, registerContactAction, updateLeadAction } from "@/server/leads/actions";

type Detail = Extract<Awaited<ReturnType<typeof getLeadAction>>, { ok: true }>["data"];

const EVENT_LABEL: Record<string, string> = { nota: "Observação", whatsapp: "WhatsApp", ligacao: "Ligação", status: "Status", sistema: "Sistema" };

function dateTime(iso: string | null) {
  return iso ? new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";
}

export function LeadDrawer({
  leadId,
  members,
  onClose,
  onChange,
  onDelete,
}: {
  leadId: string | null;
  members: Array<{ userId: string; name: string }>;
  onClose: () => void;
  onChange: (lead: Partial<LeadView> & { id: string }) => void;
  onDelete: (id: string) => void;
}) {
  const { prefs, user } = useApp();
  const [detail, setDetail] = useState<Detail | null>(null);
  const [form, setForm] = useState<Partial<LeadView>>({});
  const [tagText, setTagText] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!leadId) return;
    let cancelled = false;
    getLeadAction(leadId).then((result) => {
      if (cancelled) return;
      if (!result.ok) {
        toast.error(result.error);
        onClose();
        return;
      }
      setDetail(result.data);
      setForm(result.data.lead);
      setTagText(result.data.lead.tags.join(", "));
    });
    return () => {
      cancelled = true;
      setDetail(null);
    };
  }, [leadId, onClose]);

  const lead = detail?.lead;
  const place: Place | undefined = detail?.place;

  async function save() {
    if (!lead) return;
    setBusy("save");
    const tags = tagText.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 20);
    const patch = {
      companyName: form.companyName,
      contactName: form.contactName ?? null,
      phone: form.phone ?? null,
      whatsapp: form.whatsapp ?? null,
      website: form.website ?? null,
      instagram: form.instagram ?? null,
      email: form.email ?? null,
      notes: form.notes ?? "",
      tags,
      assignedTo: form.assignedTo ?? null,
    };
    const result = await updateLeadAction(lead.id, patch);
    setBusy(null);
    if (!result.ok) return toast.error(result.error);
    onChange({ id: lead.id, ...patch, assignedName: members.find((m) => m.userId === patch.assignedTo)?.name ?? null });
    toast.success("Lead salvo.");
  }

  async function changeStatus(status: LeadStatus) {
    if (!lead) return;
    setForm((f) => ({ ...f, status }));
    const result = await moveLeadsAction([lead.id], status);
    if (!result.ok) return toast.error(result.error);
    onChange({ id: lead.id, status });
    const refreshed = await getLeadAction(lead.id);
    if (refreshed.ok) setDetail(refreshed.data);
  }

  async function contact(channel: "whatsapp" | "ligacao") {
    if (!lead) return;
    if (lead.demo) return toast("Modo demonstração: contato bloqueado para empresas fictícias.");
    const result = await registerContactAction(lead.id, channel);
    if (result.ok) {
      onChange({ id: lead.id, status: result.data.status, lastContactAt: new Date().toISOString() });
      setForm((f) => ({ ...f, status: result.data.status }));
    }
  }

  const waDigits = (form.whatsapp ?? "").replace(/\D/g, "");
  const template = prefs.templates.find((t) => t.id === prefs.activeTemplateId) ?? prefs.templates[0]!;
  const message = place ? fillTemplate(template.body, place, user.name.split(" ")[0] ?? user.name) : "";
  const phoneDigits = (form.phone ?? "").replace(/[^\d+]/g, "");

  return (
    <Sheet open={Boolean(leadId)} onClose={onClose} title={lead?.companyName ?? "Lead"} description={lead ? `${lead.category ?? "Empresa"}${lead.city ? ` · ${lead.city}` : ""}` : undefined}>
      {!lead ? (
        <div className="space-y-4 p-5">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : (
        <div className="space-y-6 p-5">
          <div className="flex flex-wrap items-center gap-2">
            {lead.demo && <DemoBadge />}
            {lead.placeId && !lead.placeId.startsWith("import_") && (
              <Link href={`/app/empresa/${encodeURIComponent(lead.placeId)}`} className={buttonClass("ghost", "xs")}>
                Ver empresa <ArrowUpRight size={12} />
              </Link>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {waDigits.length >= 8 ? (
              <a href={`https://wa.me/${waDigits}?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer" onClick={(e) => { if (lead.demo) e.preventDefault(); void contact("whatsapp"); }} className={buttonClass("primary", "lg")}>
                <WhatsappLogo size={19} weight="fill" /> WhatsApp
              </a>
            ) : (
              <span className={buttonClass("outline", "lg", "pointer-events-none opacity-40")}>Sem WhatsApp</span>
            )}
            {phoneDigits.length >= 8 ? (
              <a href={`tel:${phoneDigits}`} onClick={(e) => { if (lead.demo) e.preventDefault(); void contact("ligacao"); }} className={buttonClass("light", "lg")}>
                <Phone size={18} weight="fill" /> Ligar
              </a>
            ) : (
              <span className={buttonClass("outline", "lg", "pointer-events-none opacity-40")}>Sem telefone</span>
            )}
          </div>

          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-mute">Status</p>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {LEAD_STATUSES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => changeStatus(s.id)}
                  aria-pressed={form.status === s.id}
                  className={cn(
                    "h-9 rounded-lg border text-[13px] font-medium transition-colors",
                    form.status === s.id ? (s.id === "cliente" ? "border-brand bg-brand text-white" : "border-paper bg-paper text-ink") : "border-line-2 text-mute-2 hover:border-mute hover:text-paper",
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-xl border border-line bg-ink-3 p-3 text-center text-xs">
            <div>
              <p className="text-mute">Primeiro contato</p>
              <p className="mt-0.5 font-medium">{formatDate(lead.firstContactAt)}</p>
            </div>
            <div>
              <p className="text-mute">Último contato</p>
              <p className="mt-0.5 font-medium">{formatDate(lead.lastContactAt)}</p>
            </div>
            <div>
              <p className="text-mute">Criado em</p>
              <p className="mt-0.5 font-medium">{formatDate(lead.createdAt)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Empresa" className="col-span-2">
              <Input value={form.companyName ?? ""} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
            </Field>
            <Field label="Contato (pessoa)" className="col-span-2">
              <Input value={form.contactName ?? ""} onChange={(e) => setForm({ ...form, contactName: e.target.value })} placeholder="Nome de quem atendeu" />
            </Field>
            <Field label="Telefone">
              <Input value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Não encontrado" />
            </Field>
            <Field label="WhatsApp">
              <Input value={form.whatsapp ?? ""} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="Não encontrado" />
            </Field>
            <Field label="Website">
              <Input value={form.website ?? ""} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="Não encontrado" />
            </Field>
            <Field label="Instagram">
              <Input value={form.instagram ?? ""} onChange={(e) => setForm({ ...form, instagram: e.target.value })} placeholder="Não encontrado" />
            </Field>
            <Field label="E-mail" className="col-span-2">
              <Input type="email" value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Não encontrado" />
            </Field>
            <Field label="Responsável">
              <Select value={form.assignedTo ?? ""} onChange={(e) => setForm({ ...form, assignedTo: e.target.value || null })}>
                <option value="">Ninguém</option>
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Tags" hint="Separe por vírgula.">
              <Input value={tagText} onChange={(e) => setTagText(e.target.value)} placeholder="sem site, restaurante" />
            </Field>
            <Field label="Observações" className="col-span-2">
              <Textarea value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={4} placeholder="Resumo do lead, proposta, valores…" />
            </Field>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={save} disabled={busy !== null} className={buttonClass("primary", "md", "flex-1")}>
              {busy === "save" && <SpinnerGap size={15} className="animate-spin" />} Salvar alterações
            </button>
            <button
              type="button"
              onClick={async () => {
                if (!confirm(`Excluir o lead ${lead.companyName}?`)) return;
                const result = await deleteLeadsAction([lead.id]);
                if (!result.ok) return toast.error(result.error);
                onDelete(lead.id);
                onClose();
                toast.success("Lead excluído.");
              }}
              className={buttonClass("ghost", "icon")}
              aria-label="Excluir lead"
            >
              <Trash size={17} />
            </button>
          </div>

          <div>
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <ChatText size={16} className="text-brand" /> Registro da conversa
            </p>
            <div className="flex gap-2">
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="O que foi conversado?" />
              <button
                type="button"
                disabled={!note.trim() || busy !== null}
                onClick={async () => {
                  setBusy("note");
                  const result = await addNoteAction(lead.id, note);
                  setBusy(null);
                  if (!result.ok) return toast.error(result.error);
                  setNote("");
                  const refreshed = await getLeadAction(lead.id);
                  if (refreshed.ok) setDetail(refreshed.data);
                }}
                className={buttonClass("outline", "md", "h-auto self-stretch")}
              >
                {busy === "note" ? <SpinnerGap size={15} className="animate-spin" /> : "Anotar"}
              </button>
            </div>
            <ol className="mt-4 space-y-3 border-l border-line pl-4">
              {detail!.events.map((event) => (
                <li key={event.id} className="relative">
                  <span className={cn("absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-ink-2", event.kind === "nota" ? "bg-paper" : event.kind === "status" ? "bg-mute" : "bg-brand")} />
                  <p className="text-xs text-mute">
                    {EVENT_LABEL[event.kind] ?? event.kind} · {event.authorName ?? "Sistema"} · {dateTime(event.createdAt)}
                  </p>
                  <p className="mt-0.5 whitespace-pre-wrap text-sm text-mute-2">{event.kind === "ligacao" ? <PhoneCall size={13} className="mr-1 inline" /> : null}{event.body}</p>
                </li>
              ))}
            </ol>
          </div>
          <p className="text-[11px] text-mute">Status atual: {STATUS_LABEL[form.status ?? lead.status]}</p>
        </div>
      )}
    </Sheet>
  );
}

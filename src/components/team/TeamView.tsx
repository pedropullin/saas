"use client";

import { Copy, Link as LinkIcon, SpinnerGap, Trash, UserPlus, WhatsappLogo } from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "@/client/toast";
import { useApp } from "@/components/shell/AppContext";
import { buttonClass } from "@/components/ui/button";
import { Select } from "@/components/ui/form";
import { Avatar, Card, PageHeader } from "@/components/ui/misc";
import { createInviteAction, removeMemberAction, revokeInviteAction, setMemberRoleAction } from "@/server/team/actions";

interface Member {
  userId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  title: string | null;
  role: "owner" | "admin" | "member";
  joinedAt: string;
  assigned: number;
  contacted: number;
  converted: number;
}

interface Invite {
  id: string;
  role: string;
  expiresAt: string;
}

interface Activity {
  id: string;
  summary: string;
  userName: string | null;
  userAvatar: string | null;
  createdAt: string;
}

const ROLE: Record<string, string> = { owner: "Dono", admin: "Administrador", member: "Membro" };

export function TeamView({ members: initialMembers, invites: initialInvites, activity }: { members: Member[]; invites: Invite[]; activity: Activity[] }) {
  const { role, plan, user } = useApp();
  const [members, setMembers] = useState(initialMembers);
  const [invites, setInvites] = useState(initialInvites);
  const [inviteRole, setInviteRole] = useState<"member" | "admin">("member");
  const [link, setLink] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const isAdmin = role === "owner" || role === "admin";
  const full = members.length >= plan.maxMembers;

  async function invite() {
    setBusy(true);
    const result = await createInviteAction(inviteRole);
    setBusy(false);
    if (!result.ok) return toast.error(result.error);
    setLink(result.data.url);
    setInvites((all) => [...all, { id: crypto.randomUUID(), role: inviteRole, expiresAt: result.data.expiresAt }]);
    navigator.clipboard?.writeText(result.data.url).then(() => toast.success("Link de convite copiado.")).catch(() => null);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-8">
      <PageHeader eyebrow="Colaboração" title="Minha equipe" description={`${members.length} de ${plan.maxMembers} ${plan.maxMembers === 1 ? "membro" : "membros"} no plano ${plan.name}. Leads e listas são compartilhados só dentro da equipe.`} />

      {isAdmin && (
        <Card className="p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="flex items-center gap-2 font-semibold">
                <UserPlus size={18} className="text-brand" /> Convidar amigos
              </h2>
              <p className="mt-1 text-sm text-mute">Gere um link de uso único, válido por 7 dias, e envie para quem vai prospectar com você.</p>
            </div>
            {full ? (
              <Link href="/app/planos" className={buttonClass("primary", "md")}>
                {plan.maxMembers === 1 ? "Mudar para o Business para convidar" : "Aumentar limite de membros"}
              </Link>
            ) : (
              <div className="flex gap-2">
                <Select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as "member" | "admin")} className="w-auto" aria-label="Papel do convidado">
                  <option value="member">Membro</option>
                  <option value="admin">Administrador</option>
                </Select>
                <button type="button" onClick={invite} disabled={busy} className={buttonClass("primary", "md")}>
                  {busy ? <SpinnerGap size={15} className="animate-spin" /> : <LinkIcon size={16} />} Gerar link
                </button>
              </div>
            )}
          </div>
          {link && (
            <div className="mt-4 flex flex-col gap-2 rounded-xl border border-brand/40 bg-brand/[0.06] p-3 sm:flex-row sm:items-center">
              <code className="min-w-0 flex-1 truncate font-mono text-xs text-mute-2">{link}</code>
              <div className="flex gap-2">
                <button type="button" onClick={() => navigator.clipboard.writeText(link).then(() => toast.success("Copiado."))} className={buttonClass("outline", "sm")}>
                  <Copy size={14} /> Copiar
                </button>
                <a href={`https://wa.me/?text=${encodeURIComponent(`Bora prospectar juntos no Prospecta.ai? Entre pela minha equipe: ${link}`)}`} target="_blank" rel="noopener noreferrer" className={buttonClass("primary", "sm")}>
                  <WhatsappLogo size={15} weight="fill" /> Enviar
                </a>
              </div>
            </div>
          )}
          {invites.length > 0 && (
            <ul className="mt-4 divide-y divide-line rounded-xl border border-line text-sm">
              {invites.map((inv) => (
                <li key={inv.id} className="flex items-center justify-between gap-3 px-3 py-2">
                  <span className="text-mute-2">
                    Convite pendente · {ROLE[inv.role]} · expira {new Date(inv.expiresAt).toLocaleDateString("pt-BR")}
                  </span>
                  <button
                    type="button"
                    onClick={async () => {
                      const result = await revokeInviteAction(inv.id);
                      if (!result.ok) return toast.error(result.error);
                      setInvites((all) => all.filter((i) => i.id !== inv.id));
                    }}
                    className="text-xs text-mute hover:text-brand"
                  >
                    Revogar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Card className="overflow-hidden">
          <h2 className="border-b border-line px-5 py-4 font-semibold">Membros</h2>
          <ul className="divide-y divide-line">
            {members.map((member) => (
              <li key={member.userId} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <Avatar name={member.name} src={member.avatarUrl} size={42} />
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {member.name} {member.userId === user.id && <span className="text-xs text-mute">(você)</span>}
                    </p>
                    <p className="truncate text-xs text-mute">
                      {member.title ?? "Cargo não informado"} · {member.email}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center text-xs sm:w-60">
                  <div>
                    <p className="text-lg font-semibold tabular-nums">{member.assigned}</p>
                    <p className="text-mute">atribuídos</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold tabular-nums">{member.contacted}</p>
                    <p className="text-mute">contatados</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold tabular-nums text-brand">{member.converted}</p>
                    <p className="text-mute">convertidos</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:w-44 sm:justify-end">
                  {role === "owner" && member.role !== "owner" ? (
                    <Select
                      value={member.role}
                      onChange={async (e) => {
                        const next = e.target.value as "member" | "admin";
                        const result = await setMemberRoleAction(member.userId, next);
                        if (!result.ok) return toast.error(result.error);
                        setMembers((all) => all.map((m) => (m.userId === member.userId ? { ...m, role: next } : m)));
                      }}
                      className="h-8 w-auto text-xs"
                      aria-label={`Papel de ${member.name}`}
                    >
                      <option value="member">Membro</option>
                      <option value="admin">Administrador</option>
                    </Select>
                  ) : (
                    <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-xs text-mute-2">{ROLE[member.role]}</span>
                  )}
                  {isAdmin && member.role !== "owner" && member.userId !== user.id && (
                    <button
                      type="button"
                      onClick={async () => {
                        if (!confirm(`Remover ${member.name} da equipe? Os leads atribuídos ficam sem responsável.`)) return;
                        const result = await removeMemberAction(member.userId);
                        if (!result.ok) return toast.error(result.error);
                        setMembers((all) => all.filter((m) => m.userId !== member.userId));
                      }}
                      className={buttonClass("ghost", "icon-sm")}
                      aria-label={`Remover ${member.name}`}
                    >
                      <Trash size={15} />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-5">
          <h2 className="font-semibold">Atividade recente</h2>
          {activity.length === 0 ? (
            <p className="mt-3 text-sm text-mute">Sem atividade ainda.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {activity.map((item) => (
                <li key={item.id} className="flex gap-2.5 text-sm">
                  <Avatar name={item.userName ?? "?"} src={item.userAvatar} size={24} />
                  <p className="min-w-0 flex-1">
                    <b className="font-medium">{item.userName ?? "Alguém"}</b> <span className="text-mute-2">{item.summary}</span>
                    <span className="block text-xs text-mute">{new Date(item.createdAt).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

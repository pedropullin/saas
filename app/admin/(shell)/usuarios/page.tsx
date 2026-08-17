"use client";

import { useMemo, useState } from "react";
import { users } from "@/lib/mock/users";
import { Reveal } from "@/components/motion/Reveal";
import { FilterBar } from "@/components/admin/FilterBar";
import { Tabs } from "@/components/ui/Tabs";
import { Badge } from "@/components/ui/Badge";
import { SlideOver } from "@/components/admin/SlideOver";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/Table";
import { formatDate, formatRelative } from "@/lib/utils";
import type { AppUser } from "@/lib/types";

const STATUS_LABEL: Record<AppUser["status"], string> = {
  active: "Ativo",
  invited: "Convidado",
  suspended: "Suspenso",
};

const STATUS_TONE: Record<AppUser["status"], "accent" | "outline" | "neutral"> = {
  active: "accent",
  invited: "outline",
  suspended: "neutral",
};

export default function AdminUsuariosPage() {
  const [search, setSearch] = useState("");
  const [plan, setPlan] = useState<AppUser["plan"] | "todos">("todos");
  const [selected, setSelected] = useState<AppUser | null>(null);

  const filtered = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());
      const matchesPlan = plan === "todos" || user.plan === plan;
      return matchesSearch && matchesPlan;
    });
  }, [search, plan]);

  return (
    <div className="mx-auto max-w-6xl">
      <Reveal>
        <p className="text-label font-medium uppercase tracking-[0.08em] text-neutral-500">Usuários</p>
        <h1 className="mt-2 text-h1 font-medium text-ink">{users.length} usuários na plataforma</h1>
      </Reveal>

      <Reveal delay={0.06} className="mt-8">
        <FilterBar search={search} onSearchChange={setSearch} placeholder="Buscar por nome ou e-mail...">
          <Tabs
            value={plan}
            onChange={setPlan}
            options={[
              { value: "todos", label: "Todos" },
              { value: "Free", label: "Free" },
              { value: "Pro", label: "Pro" },
              { value: "Business", label: "Business" },
            ]}
          />
        </FilterBar>
      </Reveal>

      <Reveal delay={0.1} className="mt-6">
        <Table>
          <TableHeader>
            <TableHead>Nome</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Plano</TableHead>
            <TableHead>Projetos</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Última atividade</TableHead>
            <TableHead>Ações</TableHead>
          </TableHeader>
          <TableBody>
            {filtered.map((user) => (
              <TableRow key={user.id} className="cursor-pointer" onClick={() => setSelected(user)}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell className="text-neutral-600">{user.email}</TableCell>
                <TableCell className="text-neutral-600">{user.plan}</TableCell>
                <TableCell className="text-neutral-600">{user.projectsCount}</TableCell>
                <TableCell>
                  <Badge tone={STATUS_TONE[user.status]}>{STATUS_LABEL[user.status]}</Badge>
                </TableCell>
                <TableCell className="text-neutral-500">{formatRelative(user.lastActivityAt)}</TableCell>
                <TableCell>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelected(user);
                    }}
                    className="text-[0.8125rem] font-medium text-neutral-500 hover:text-ink"
                  >
                    Ver detalhes
                  </button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell className="py-8 text-center text-neutral-400" colSpan={7}>
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Reveal>

      <SlideOver open={selected !== null} onClose={() => setSelected(null)}>
        {selected && (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-ink/8 px-6 py-5">
              <p className="text-label font-medium uppercase tracking-[0.08em] text-neutral-500">
                Detalhe do usuário
              </p>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Fechar"
                className="text-neutral-400 transition-colors hover:text-ink"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 px-6 py-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-ink text-[1rem] font-medium text-off-white">
                  {selected.initials}
                </div>
                <div>
                  <p className="text-[1.0625rem] font-medium text-ink">{selected.name}</p>
                  <p className="text-[0.8125rem] text-neutral-500">{selected.email}</p>
                </div>
              </div>

              <dl className="mt-8 space-y-4 text-[0.8125rem]">
                <Row label="Plano" value={selected.plan} />
                <Row label="Projetos" value={String(selected.projectsCount)} />
                <Row label="Status">
                  <Badge tone={STATUS_TONE[selected.status]}>{STATUS_LABEL[selected.status]}</Badge>
                </Row>
                <Row label="Última atividade" value={formatRelative(selected.lastActivityAt)} />
                <Row label="Cliente desde" value={formatDate(selected.createdAt)} />
              </dl>
            </div>

            <div className="flex gap-3 border-t border-ink/8 px-6 py-5">
              <button
                type="button"
                className="flex-1 rounded-[3px] border border-ink/15 py-2.5 text-[0.8125rem] font-medium text-ink transition-colors hover:border-ink"
              >
                Enviar mensagem
              </button>
              <button
                type="button"
                className="flex-1 rounded-[3px] bg-ink py-2.5 text-[0.8125rem] font-medium text-off-white transition-colors hover:bg-accent hover:text-accent-ink"
              >
                Ver projetos
              </button>
            </div>
          </div>
        )}
      </SlideOver>
    </div>
  );
}

function Row({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-ink/6 pb-3">
      <dt className="text-neutral-500">{label}</dt>
      <dd className="font-medium text-ink">{children ?? value}</dd>
    </div>
  );
}

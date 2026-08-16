"use client";

import { useMemo, useState } from "react";
import { users } from "@/lib/mock/users";
import { Reveal } from "@/components/motion/Reveal";
import { FilterBar } from "@/components/admin/FilterBar";
import { Tabs } from "@/components/ui/Tabs";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell } from "@/components/ui/Table";
import { formatRelative } from "@/lib/utils";
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
          <TableHead>
            <TableHeadCell>Nome</TableHeadCell>
            <TableHeadCell>E-mail</TableHeadCell>
            <TableHeadCell>Plano</TableHeadCell>
            <TableHeadCell>Projetos</TableHeadCell>
            <TableHeadCell>Status</TableHeadCell>
            <TableHeadCell>Última atividade</TableHeadCell>
            <TableHeadCell>Ações</TableHeadCell>
          </TableHead>
          <TableBody>
            {filtered.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell className="text-neutral-600">{user.email}</TableCell>
                <TableCell className="text-neutral-600">{user.plan}</TableCell>
                <TableCell className="text-neutral-600">{user.projectsCount}</TableCell>
                <TableCell>
                  <Badge tone={STATUS_TONE[user.status]}>{STATUS_LABEL[user.status]}</Badge>
                </TableCell>
                <TableCell className="text-neutral-500">{formatRelative(user.lastActivityAt)}</TableCell>
                <TableCell>
                  <button type="button" className="text-[0.8125rem] font-medium text-neutral-500 hover:text-ink">
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
    </div>
  );
}

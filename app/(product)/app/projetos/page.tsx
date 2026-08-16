"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { projects } from "@/lib/mock/projects";
import { Reveal } from "@/components/motion/Reveal";
import { Tabs } from "@/components/ui/Tabs";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell } from "@/components/ui/Table";
import { formatDate } from "@/lib/utils";
import type { ProjectStatus } from "@/lib/types";

const STATUS_LABEL: Record<ProjectStatus, string> = {
  rascunho: "Rascunho",
  em_andamento: "Em andamento",
  concluido: "Concluído",
};

const STATUS_TONE: Record<ProjectStatus, "neutral" | "outline" | "accent"> = {
  rascunho: "neutral",
  em_andamento: "outline",
  concluido: "accent",
};

export default function ProjetosPage() {
  const [filter, setFilter] = useState<ProjectStatus | "todos">("todos");

  const filtered = useMemo(
    () => (filter === "todos" ? projects : projects.filter((p) => p.status === filter)),
    [filter]
  );

  return (
    <div className="mx-auto max-w-6xl">
      <Reveal className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-label font-medium uppercase tracking-[0.08em] text-neutral-500">
            Projetos
          </p>
          <h1 className="mt-2 text-h1 font-medium text-ink">Todos os projetos</h1>
        </div>
        <Tabs
          value={filter}
          onChange={setFilter}
          options={[
            { value: "todos", label: "Todos" },
            { value: "rascunho", label: "Rascunho" },
            { value: "em_andamento", label: "Em andamento" },
            { value: "concluido", label: "Concluído" },
          ]}
        />
      </Reveal>

      <Reveal delay={0.1} className="mt-10">
        <Table>
          <TableHead>
            <TableHeadCell>Projeto</TableHeadCell>
            <TableHeadCell>Responsável</TableHeadCell>
            <TableHeadCell>Segmento</TableHeadCell>
            <TableHeadCell>Plano</TableHeadCell>
            <TableHeadCell>Status</TableHeadCell>
            <TableHeadCell>Atualizado</TableHeadCell>
          </TableHead>
          <TableBody>
            {filtered.map((project) => (
              <TableRow key={project.id}>
                <TableCell className="font-medium">
                  {project.identityId ? (
                    <Link href={`/app/identidade/${project.identityId}`} className="hover:text-accent-dim">
                      {project.name}
                    </Link>
                  ) : (
                    project.name
                  )}
                </TableCell>
                <TableCell className="text-neutral-600">{project.ownerName}</TableCell>
                <TableCell className="text-neutral-600">{project.segment}</TableCell>
                <TableCell className="text-neutral-600">{project.plan}</TableCell>
                <TableCell>
                  <Badge tone={STATUS_TONE[project.status]}>{STATUS_LABEL[project.status]}</Badge>
                </TableCell>
                <TableCell className="text-neutral-500">{formatDate(project.updatedAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Reveal>
    </div>
  );
}

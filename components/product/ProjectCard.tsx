"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Project } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { VMark } from "@/components/ui/VMark";
import { formatRelative } from "@/lib/utils";
import { EASE_EDITORIAL } from "@/lib/motion/easing";
import { usePointerGlow } from "@/hooks/usePointerGlow";

const STATUS_LABEL: Record<Project["status"], string> = {
  rascunho: "Rascunho",
  em_andamento: "Em andamento",
  concluido: "Concluído",
};

const STATUS_TONE: Record<Project["status"], "neutral" | "outline" | "accent"> = {
  rascunho: "neutral",
  em_andamento: "outline",
  concluido: "accent",
};

export function ProjectCard({ project }: { project: Project }) {
  const href = project.identityId ? `/app/identidade/${project.identityId}` : "/app/criar";
  const { ref, onPointerMove } = usePointerGlow<HTMLDivElement>();

  return (
    <Link href={href}>
      <motion.div
        ref={ref}
        onPointerMove={onPointerMove}
        whileHover={{ y: -3 }}
        transition={{ duration: 0.25, ease: EASE_EDITORIAL }}
        className="glow-card flex h-full flex-col justify-between rounded-md border border-ink/8 bg-paper p-5"
      >
        <div className="flex items-start justify-between">
          <VMark variant="mono" size={22} tone="ink" />
          <Badge tone={STATUS_TONE[project.status]}>{STATUS_LABEL[project.status]}</Badge>
        </div>
        <div className="mt-6">
          <p className="text-[0.9375rem] font-medium text-ink">{project.name}</p>
          <p className="mt-1 text-[0.8125rem] text-neutral-500">{project.segment}</p>
        </div>
        <p className="mt-5 text-[0.75rem] text-neutral-400">
          Atualizado {formatRelative(project.updatedAt)}
        </p>
      </motion.div>
    </Link>
  );
}

import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { ProjectCard } from "@/components/product/ProjectCard";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { projects } from "@/lib/mock/projects";
import { identities } from "@/lib/mock/identities";
import { formatRelative } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

const inProgress = projects.filter((p) => p.status === "em_andamento");
const recent = [...projects].sort(
  (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
);

const activity = [
  { label: "Identidade de Norte foi finalizada", time: recent[0]?.updatedAt ?? "" },
  { label: "Paralelo Studio entrou em direção visual", time: projects[6]?.updatedAt ?? "" },
  { label: "Théo Barros criou um novo rascunho", time: projects[7]?.updatedAt ?? "" },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <Reveal className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-label font-medium uppercase tracking-[0.08em] text-neutral-500">
            Dashboard
          </p>
          <h1 className="mt-2 text-h1 font-medium text-ink">Bem-vinda de volta, Marina.</h1>
        </div>
        <Button href="/app/criar">Nova identidade</Button>
      </Reveal>

      <Stagger className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Projetos", value: projects.length },
          { label: "Em andamento", value: inProgress.length },
          { label: "Identidades criadas", value: identities.length },
          { label: "Designers conectados", value: 2 },
        ].map((stat) => (
          <StaggerItem key={stat.label}>
            <div className="rounded-md border border-ink/8 p-5">
              <p className="text-3xl font-medium text-ink">
                <AnimatedNumber value={stat.value} />
              </p>
              <p className="mt-1.5 text-[0.8125rem] text-neutral-500">{stat.label}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>

      <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-h3 font-medium text-ink">Projetos recentes</h2>
            <a href="/app/projetos" className="text-[0.8125rem] font-medium text-neutral-500 hover:text-ink">
              Ver todos
            </a>
          </div>
          <Stagger className="grid gap-4 sm:grid-cols-2">
            {recent.slice(0, 4).map((project) => (
              <StaggerItem key={project.id}>
                <ProjectCard project={project} />
              </StaggerItem>
            ))}
          </Stagger>

          {inProgress.length > 0 && (
            <div className="mt-12">
              <h2 className="mb-5 text-h3 font-medium text-ink">Em andamento</h2>
              <Stagger className="grid gap-4 sm:grid-cols-2">
                {inProgress.map((project) => (
                  <StaggerItem key={project.id}>
                    <ProjectCard project={project} />
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          )}
        </div>

        <Reveal delay={0.1}>
          <h2 className="mb-5 text-h3 font-medium text-ink">Atividade recente</h2>
          <ul className="space-y-5 border-l border-ink/8 pl-5">
            {activity.map((item, index) => (
              <li key={index} className="relative">
                <span className="absolute -left-[23px] top-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
                <p className="text-[0.875rem] text-ink">{item.label}</p>
                <p className="mt-0.5 text-[0.75rem] text-neutral-400">
                  {item.time ? formatRelative(item.time) : ""}
                </p>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </div>
  );
}

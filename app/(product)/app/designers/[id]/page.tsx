import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { designers, getDesignerById } from "@/lib/mock/designers";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { projects } from "@/lib/mock/projects";
import { identities } from "@/lib/mock/identities";
import { VMark } from "@/components/ui/VMark";

export function generateStaticParams() {
  return designers.map((designer) => ({ id: designer.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const designer = getDesignerById(id);
  return { title: designer ? designer.name : "Designer" };
}

export default async function DesignerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const designer = getDesignerById(id);
  if (!designer) notFound();

  const portfolio = projects
    .filter((project) => project.designerId === designer.id)
    .map((project) => identities.find((identity) => identity.id === project.identityId))
    .filter((identity): identity is NonNullable<typeof identity> => Boolean(identity));

  return (
    <div className="mx-auto max-w-3xl">
      <Reveal className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ink text-lg font-medium text-off-white">
          {designer.initials}
        </div>
        <div>
          <h1 className="text-h1 font-medium text-ink">{designer.name}</h1>
          <p className="mt-1 text-[0.9375rem] text-neutral-500">{designer.specialty}</p>
        </div>
      </Reveal>

      <Reveal delay={0.08} className="mt-8 grid grid-cols-3 gap-3 border-y border-ink/8 py-6 text-center">
        <div>
          <p className="text-2xl font-medium text-ink">{designer.experienceYears}</p>
          <p className="text-[0.75rem] text-neutral-500">Anos de experiência</p>
        </div>
        <div>
          <p className="text-2xl font-medium text-ink">{designer.projectsCount}</p>
          <p className="text-[0.75rem] text-neutral-500">Projetos entregues</p>
        </div>
        <div>
          <p className="text-2xl font-medium text-ink">{designer.rating.toFixed(1)}</p>
          <p className="text-[0.75rem] text-neutral-500">Avaliação</p>
        </div>
      </Reveal>

      <Reveal delay={0.14} className="mt-8">
        <p className="text-body-lg text-neutral-600">{designer.bio}</p>
      </Reveal>

      {portfolio.length > 0 && (
        <Reveal delay={0.2} className="mt-12">
          <p className="mb-4 text-label font-medium uppercase tracking-[0.08em] text-neutral-500">
            Trabalhos recentes
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {portfolio.map((identity) => (
              <div key={identity.id} className="rounded-md border border-ink/8 p-5">
                <VMark variant={identity.symbolVariant} size={24} tone="ink" />
                <p className="mt-4 text-[0.875rem] font-medium text-ink">{identity.brandName}</p>
              </div>
            ))}
          </div>
        </Reveal>
      )}

      <Reveal delay={0.26} className="mt-12">
        <Button>Solicitar refinamento com {designer.name.split(" ")[0]}</Button>
      </Reveal>
    </div>
  );
}

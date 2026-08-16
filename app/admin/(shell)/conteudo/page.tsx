import type { Metadata } from "next";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

export const metadata: Metadata = { title: "Conteúdo — Admin" };

const BLOCKS = [
  { title: "Hero — Headline", value: "Crie marcas extraordinárias com inteligência.", updated: "16 ago 2026" },
  { title: "Hero — Subcopy", value: "Da ideia ao sistema visual completo.", updated: "16 ago 2026" },
  { title: "Manifesto", value: "Marcas não deveriam começar com uma tela em branco.", updated: "12 ago 2026" },
  { title: "CTA final", value: "Sua próxima marca começa aqui.", updated: "10 ago 2026" },
];

export default function AdminConteudoPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <Reveal>
        <p className="text-label font-medium uppercase tracking-[0.08em] text-neutral-500">
          Conteúdo
        </p>
        <h1 className="mt-2 text-h1 font-medium text-ink">Blocos do site institucional</h1>
      </Reveal>

      <Stagger className="mt-10 divide-y divide-ink/8 border-y border-ink/8">
        {BLOCKS.map((block) => (
          <StaggerItem key={block.title} className="flex items-center justify-between gap-6 py-6">
            <div>
              <p className="text-[0.75rem] font-medium uppercase tracking-[0.06em] text-neutral-500">
                {block.title}
              </p>
              <p className="mt-1.5 text-[0.9375rem] text-ink">{block.value}</p>
              <p className="mt-1.5 text-[0.75rem] text-neutral-400">Editado em {block.updated}</p>
            </div>
            <button type="button" className="shrink-0 text-[0.8125rem] font-medium text-neutral-500 hover:text-ink">
              Editar
            </button>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}

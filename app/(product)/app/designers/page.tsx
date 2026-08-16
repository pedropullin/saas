import type { Metadata } from "next";
import { designers } from "@/lib/mock/designers";
import { DesignerCard } from "@/components/product/DesignerCard";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

export const metadata: Metadata = { title: "Designers" };

export default function DesignersPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <Reveal>
        <p className="text-label font-medium uppercase tracking-[0.08em] text-neutral-500">
          Marketplace
        </p>
        <h1 className="mt-2 text-h1 font-medium text-ink">Designers</h1>
        <p className="mt-3 max-w-lg text-body-lg text-neutral-600">
          Especialistas prontos para refinar sua identidade e transformá-la em um sistema definitivo.
        </p>
      </Reveal>

      <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {designers.map((designer) => (
          <StaggerItem key={designer.id}>
            <DesignerCard designer={designer} />
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}

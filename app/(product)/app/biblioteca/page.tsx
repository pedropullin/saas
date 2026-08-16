import type { Metadata } from "next";
import { identities } from "@/lib/mock/identities";
import { VMark } from "@/components/ui/VMark";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

export const metadata: Metadata = { title: "Biblioteca" };

export default function BibliotecaPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <Reveal>
        <p className="text-label font-medium uppercase tracking-[0.08em] text-neutral-500">
          Biblioteca
        </p>
        <h1 className="mt-2 text-h1 font-medium text-ink">Ativos de marca</h1>
        <p className="mt-3 max-w-lg text-body-lg text-neutral-600">
          Símbolos, logos e paletas de todas as identidades geradas, prontos para reutilizar.
        </p>
      </Reveal>

      <Stagger className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {identities.map((identity) => (
          <StaggerItem key={identity.id}>
            <div className="rounded-md border border-ink/8 p-5">
              <div className="flex aspect-square items-center justify-center rounded-[6px] bg-off-white">
                <VMark variant={identity.symbolVariant} size={48} tone="ink" />
              </div>
              <p className="mt-4 text-[0.9375rem] font-medium text-ink">{identity.brandName}</p>
              <div className="mt-3 flex gap-1">
                {identity.colors.map((color) => (
                  <span
                    key={color.hex}
                    className="h-4 w-4 rounded-[2px] border border-ink/8"
                    style={{ backgroundColor: color.hex }}
                  />
                ))}
              </div>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}

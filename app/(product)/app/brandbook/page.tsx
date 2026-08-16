import type { Metadata } from "next";
import Link from "next/link";
import { identities } from "@/lib/mock/identities";
import { VMark } from "@/components/ui/VMark";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

export const metadata: Metadata = { title: "Brand Books" };

export default function BrandBooksPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <Reveal>
        <p className="text-label font-medium uppercase tracking-[0.08em] text-neutral-500">
          Biblioteca
        </p>
        <h1 className="mt-2 text-h1 font-medium text-ink">Brand Books</h1>
        <p className="mt-3 max-w-lg text-body-lg text-neutral-600">
          As diretrizes completas de cada identidade gerada, prontas para orientar qualquer equipe.
        </p>
      </Reveal>

      <Stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {identities.map((identity) => (
          <StaggerItem key={identity.id}>
            <Link
              href={`/app/brandbook/${identity.id}`}
              className="group flex h-full flex-col justify-between rounded-md border border-ink/8 p-6 transition-colors hover:border-ink/20"
            >
              <VMark variant={identity.symbolVariant} size={32} tone="ink" />
              <div className="mt-8">
                <p className="text-[1rem] font-medium text-ink">{identity.brandName}</p>
                <p className="mt-1 text-[0.8125rem] text-neutral-500">{identity.segment}</p>
              </div>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}

import type { BrandBook, Identity } from "@/lib/types";
import { VMark } from "@/components/ui/VMark";
import { Reveal } from "@/components/motion/Reveal";
import { Divider } from "@/components/ui/Divider";

export function BrandBookLayout({ identity, brandBook }: { identity: Identity; brandBook: BrandBook }) {
  return (
    <div className="mx-auto max-w-3xl">
      {/* Cover */}
      <Reveal className="flex flex-col items-center py-20 text-center">
        <VMark variant={identity.symbolVariant} size={72} tone="ink" />
        <p className="mt-8 text-label font-medium uppercase tracking-[0.08em] text-neutral-500">
          Brand Book
        </p>
        <h1 className="mt-3 text-display font-medium text-ink">{identity.brandName}</h1>
        <p className="mt-4 text-body-lg text-neutral-600">{identity.segment}</p>
      </Reveal>

      <Divider />

      {/* Sections */}
      <div className="divide-y divide-ink/8">
        {brandBook.sections.map((section, index) => (
          <Reveal key={section.id} className="grid gap-4 py-14 md:grid-cols-[220px_1fr] md:gap-10">
            <div>
              <span className="text-[0.8125rem] font-medium tabular-nums text-neutral-400">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h2 className="mt-2 text-h3 font-medium text-ink">{section.title}</h2>
            </div>
            <p className="max-w-xl text-body-lg text-neutral-600 text-pretty">{section.body}</p>
          </Reveal>
        ))}
      </div>

      <Divider />

      {/* Palette + typography quick reference */}
      <Reveal className="grid gap-8 py-14 sm:grid-cols-2">
        <div>
          <p className="text-label font-medium uppercase tracking-[0.08em] text-neutral-500">Paleta</p>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {identity.colors.map((color) => (
              <div key={color.hex}>
                <div className="h-14 rounded-[4px] border border-ink/8" style={{ backgroundColor: color.hex }} />
                <p className="mt-1.5 text-[0.6875rem] text-neutral-500">{color.hex}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-label font-medium uppercase tracking-[0.08em] text-neutral-500">
            Tipografia
          </p>
          <p className="mt-4 text-4xl font-medium text-ink">Aa Bb Cc</p>
          <p className="mt-2 text-[0.875rem] text-neutral-500">
            {identity.typography.display} / {identity.typography.body}
          </p>
        </div>
      </Reveal>
    </div>
  );
}

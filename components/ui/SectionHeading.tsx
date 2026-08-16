import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && (
        <p className="mb-4 text-label font-medium uppercase tracking-[0.08em] text-neutral-500">
          {eyebrow}
        </p>
      )}
      <h2 className="text-h2 font-medium text-ink text-balance">{title}</h2>
      {description && (
        <p className="mt-4 text-body-lg text-neutral-600 text-pretty">{description}</p>
      )}
    </div>
  );
}

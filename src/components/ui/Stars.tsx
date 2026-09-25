import { cn } from "@/lib/utils";

const STAR = "M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z";

/** Estrelas com preenchimento fracionado (ex.: 4,3). */
export function Stars({ value, size = 14, className }: { value: number | null; size?: number; className?: string }) {
  const rating = Math.max(0, Math.min(5, value ?? 0));
  return (
    <span className={cn("inline-flex items-center gap-[2px]", className)} aria-label={`${rating.toFixed(1)} de 5 estrelas`}>
      {Array.from({ length: 5 }, (_, i) => {
        const fill = Math.max(0, Math.min(1, rating - i));
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <svg viewBox="0 0 20 20" width={size} height={size} className="absolute inset-0 text-line-2" aria-hidden="true">
              <path d={STAR} fill="currentColor" />
            </svg>
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <svg viewBox="0 0 20 20" width={size} height={size} className="text-brand" aria-hidden="true">
                <path d={STAR} fill="currentColor" />
              </svg>
            </span>
          </span>
        );
      })}
    </span>
  );
}

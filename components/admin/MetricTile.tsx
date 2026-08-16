import { AnimatedNumber } from "@/components/ui/AnimatedNumber";

export function MetricTile({
  label,
  value,
  format,
  trend,
}: {
  label: string;
  value: number;
  format?: "number" | "currency" | "percent";
  trend?: string;
}) {
  return (
    <div className="rounded-md border border-ink/8 p-5">
      <p className="text-[0.75rem] text-neutral-500">{label}</p>
      <p className="mt-2 text-2xl font-medium text-ink">
        <AnimatedNumber value={value} format={format} />
      </p>
      {trend && <p className="mt-1.5 text-[0.75rem] font-medium text-accent-dim">{trend}</p>}
    </div>
  );
}

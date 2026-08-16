"use client";

const COLORS = ["var(--color-ink)", "var(--color-accent)", "var(--color-neutral-300)"];

export function MiniDonut({ data }: { data: { label: string; value: number }[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  const segments = data.reduce<{ label: string; dash: number; offset: number }[]>((acc, d) => {
    const previous = acc[acc.length - 1];
    const startOffset = previous ? previous.offset + previous.dash : 0;
    const dash = (d.value / total) * circumference;
    acc.push({ label: d.label, dash, offset: startOffset });
    return acc;
  }, []);

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 100 100" className="h-28 w-28 -rotate-90" role="img" aria-label="Distribuição por plano">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--color-neutral-100)" strokeWidth={14} />
        {segments.map((segment, i) => (
          <circle
            key={segment.label}
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={COLORS[i % COLORS.length]}
            strokeWidth={14}
            strokeDasharray={`${segment.dash} ${circumference - segment.dash}`}
            strokeDashoffset={-segment.offset}
            strokeLinecap="butt"
          />
        ))}
      </svg>
      <ul className="space-y-2">
        {data.map((d, i) => (
          <li key={d.label} className="flex items-center gap-2 text-[0.8125rem] text-neutral-600">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            {d.label} <span className="text-neutral-400">— {d.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

import { cn, initials } from "@/lib/utils";

export function Chip({
  children,
  tone = "default",
  title,
  className,
}: {
  children: React.ReactNode;
  tone?: "default" | "red" | "solid" | "dim" | "light";
  title?: string;
  className?: string;
}) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex h-6 items-center gap-1 whitespace-nowrap rounded-md px-2 text-[11px] font-medium",
        tone === "default" && "border border-line-2 text-mute-2",
        tone === "red" && "border border-brand/50 bg-brand/[0.06] text-[#ff4d55]",
        tone === "solid" && "bg-brand text-white",
        tone === "dim" && "bg-white/[0.05] text-mute",
        tone === "light" && "bg-paper text-ink",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Avatar({ name, src, size = 32, className }: { name: string; src?: string | null; size?: number; className?: string }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name} width={size} height={size} className={cn("shrink-0 rounded-full object-cover", className)} style={{ width: size, height: size }} />;
  }
  return (
    <span
      aria-hidden="true"
      className={cn("grid shrink-0 place-items-center rounded-full bg-paper font-semibold text-ink", className)}
      style={{ width: size, height: size, fontSize: Math.max(10, size * 0.38) }}
    >
      {initials(name)}
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-md", className)} aria-hidden="true" />;
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl border border-line bg-ink-3 shadow-card", className)}>{children}</div>;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">{eyebrow}</p>}
        <h1 className="mt-1.5 text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-mute">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center rounded-2xl border border-dashed border-line-2 px-6 py-14 text-center", className)}>
      {icon && <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl border border-line-2 bg-ink-3 text-mute-2">{icon}</div>}
      <p className="text-lg font-semibold tracking-tight">{title}</p>
      {description && <p className="mt-1.5 max-w-md text-sm text-mute">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = "Algo deu errado", message, action }: { title?: string; message: string; action?: React.ReactNode }) {
  return (
    <div role="alert" className="rounded-2xl border border-brand/40 bg-brand/[0.06] p-5">
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm text-mute-2">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function DemoBadge({ className }: { className?: string }) {
  return (
    <span className={cn("rounded bg-brand px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-white", className)} title="Dado fictício do modo demonstração">
      DEMO
    </span>
  );
}

import { Check } from "@phosphor-icons/react/dist/ssr";
import { formatPrice, PLAN_ORDER, PLANS, type PlanId } from "@/lib/plans";
import { cn } from "@/lib/utils";

/** Cartões de planos usados na landing e dentro do app. */
export function PlanCards({ actions, current }: { actions: Record<PlanId, React.ReactNode>; current?: PlanId }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {PLAN_ORDER.map((id) => {
        const plan = PLANS[id];
        const highlight = plan.highlight;
        return (
          <div
            key={id}
            className={cn(
              "relative flex flex-col rounded-3xl border p-6 md:p-7",
              highlight ? "border-brand/60 bg-gradient-to-b from-brand/[0.09] to-ink-3 shadow-glow" : "border-line bg-ink-3",
            )}
          >
            {highlight && (
              <span className="absolute -top-3 left-6 rounded-full bg-brand px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
                Mais escolhido
              </span>
            )}
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold tracking-tight">{plan.name}</h3>
              {current === id && <span className="rounded-full bg-paper px-2.5 py-0.5 text-[11px] font-semibold text-ink">Seu plano</span>}
            </div>
            <p className="mt-1 text-sm text-mute">{plan.tagline}</p>
            <p className="mt-6 flex items-baseline gap-1">
              <span className="text-4xl font-semibold tracking-tighter">{formatPrice(plan.priceMonthly)}</span>
              {plan.priceMonthly > 0 && <span className="text-sm text-mute">/mês</span>}
            </p>
            <ul className="mt-6 flex-1 space-y-2.5 text-sm">
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-2.5 text-mute-2">
                  <Check size={16} weight="bold" className="mt-0.5 shrink-0 text-brand" />
                  {feature}
                </li>
              ))}
            </ul>
            <div className="mt-7">{actions[id]}</div>
          </div>
        );
      })}
    </div>
  );
}

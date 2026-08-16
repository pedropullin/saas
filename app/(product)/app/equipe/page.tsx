import type { Metadata } from "next";
import { users } from "@/lib/mock/users";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Equipe" };

const team = users.slice(0, 5);

export default function EquipePage() {
  return (
    <div className="mx-auto max-w-4xl">
      <Reveal className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-label font-medium uppercase tracking-[0.08em] text-neutral-500">
            Equipe
          </p>
          <h1 className="mt-2 text-h1 font-medium text-ink">Quem trabalha com você</h1>
        </div>
        <Button variant="secondary">Convidar pessoa</Button>
      </Reveal>

      <Stagger className="mt-10 divide-y divide-ink/8 border-y border-ink/8">
        {team.map((member) => (
          <StaggerItem key={member.id} className="flex items-center justify-between gap-4 py-5">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-[0.8125rem] font-medium text-off-white">
                {member.initials}
              </div>
              <div>
                <p className="text-[0.9375rem] font-medium text-ink">{member.name}</p>
                <p className="text-[0.8125rem] text-neutral-500">{member.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge tone="outline">{member.plan}</Badge>
              <Badge tone={member.status === "active" ? "accent" : "neutral"}>
                {member.status === "active" ? "Ativo" : member.status === "invited" ? "Convidado" : "Suspenso"}
              </Badge>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}

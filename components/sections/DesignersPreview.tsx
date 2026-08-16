import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { Button } from "@/components/ui/Button";
import { DesignerCard } from "@/components/product/DesignerCard";
import { designers } from "@/lib/mock/designers";

const featured = designers.slice(0, 3);

export function DesignersPreview() {
  return (
    <section id="designers" className="py-28 md:py-36">
      <Container>
        <Reveal className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="A ponte para o humano"
            title="Quando a IA entrega a base, um designer leva além."
            description="Conecte seu projeto a especialistas para refinar a primeira versão em uma identidade definitiva."
          />
          <Button href="/app/designers" variant="secondary">
            Ver todos os designers
          </Button>
        </Reveal>

        <Stagger className="mt-14 grid gap-5 md:grid-cols-3">
          {featured.map((designer) => (
            <StaggerItem key={designer.id}>
              <DesignerCard designer={designer} />
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}

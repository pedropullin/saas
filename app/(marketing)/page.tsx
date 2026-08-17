import { Hero } from "@/components/landing/Hero";
import { FlowSection } from "@/components/landing/FlowSection";
import { BuildSection } from "@/components/landing/BuildSection";
import { AISection } from "@/components/landing/AISection";
import { DesignerSection } from "@/components/landing/DesignerSection";
import { BrandShowcase } from "@/components/landing/BrandShowcase";
import { ProcessSection } from "@/components/landing/ProcessSection";
import { Pricing } from "@/components/landing/Pricing";
import { FinalCta } from "@/components/landing/FinalCta";

export default function Home() {
  return (
    <>
      {/* 1 — Build your identity. */}
      <Hero />
      {/* 2 — Uma identidade. Em minutos. */}
      <FlowSection />
      {/* 3 — the identity assembling on scroll */}
      <BuildSection />
      {/* 4 — AI + Human */}
      <AISection />
      {/* the human half, with names */}
      <DesignerSection />
      {/* 5 — the system applied */}
      <BrandShowcase />
      {/* 6 — 01 Briefing → 04 Final Brand */}
      <ProcessSection />
      <Pricing />
      {/* 7 — Your brand starts here. */}
      <FinalCta />
    </>
  );
}

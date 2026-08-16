import { Hero } from "@/components/sections/Hero";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { LiveDemo } from "@/components/sections/LiveDemo";
import { BrandBoardShowcase } from "@/components/sections/BrandBoardShowcase";
import { ProductPreview } from "@/components/sections/ProductPreview";
import { DesignersPreview } from "@/components/sections/DesignersPreview";
import { Benefits } from "@/components/sections/Benefits";
import { PricingTeaser } from "@/components/sections/PricingTeaser";
import { Manifesto } from "@/components/sections/Manifesto";
import { BeforeAfter } from "@/components/sections/BeforeAfter";
import { FinalCta } from "@/components/sections/FinalCta";

export default function Home() {
  return (
    <>
      <Hero />
      <ProcessSteps />
      <LiveDemo />
      <BrandBoardShowcase />
      <ProductPreview />
      <DesignersPreview />
      <Benefits />
      <PricingTeaser />
      <Manifesto />
      <BeforeAfter />
      <FinalCta />
    </>
  );
}

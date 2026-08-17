import { CinematicHero } from "@/components/experience/CinematicHero";
import { BrandGenesis } from "@/components/experience/BrandGenesis";
import { TransformGate } from "@/components/experience/TransformGate";
import { DashboardReveal } from "@/components/experience/DashboardReveal";
import { SplitBriefingIdentity } from "@/components/experience/SplitBriefingIdentity";
import { BrandBoardEditorial } from "@/components/experience/BrandBoardEditorial";
import { VSymbolSystem } from "@/components/experience/VSymbolSystem";
import { TypographyWords } from "@/components/experience/TypographyWords";
import { ApplicationsOrbit } from "@/components/experience/ApplicationsOrbit";
import { MobileInteractive } from "@/components/experience/MobileInteractive";
import { AIDesignerFlow } from "@/components/experience/AIDesignerFlow";
import { DesignerMarketplace } from "@/components/experience/DesignerMarketplace";
import { FinalCycle } from "@/components/experience/FinalCycle";

export default function Home() {
  return (
    <>
      <CinematicHero />
      <BrandGenesis />
      <TransformGate label="Entrando no produto." tone="accent" />
      <DashboardReveal />
      <SplitBriefingIdentity />
      <BrandBoardEditorial />
      <VSymbolSystem />
      <TypographyWords />
      <TransformGate label="A marca em aplicação." tone="ink" />
      <ApplicationsOrbit />
      <MobileInteractive />
      <AIDesignerFlow />
      <TransformGate label="Designers reais." tone="paper" />
      <DesignerMarketplace />
      <FinalCycle />
    </>
  );
}

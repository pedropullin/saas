import type { GenerationStep } from "../types";

/** Fictional briefing used in the "Veja a VEYRO criando uma marca" section. */
export const demoBriefing = {
  brandName: "Norte",
  segment: "Arquitetura",
  architecture: "Estúdio de arquitetura residencial e comercial",
  personality: ["Moderna", "Minimalista", "Sofisticada"],
};

/** Shared generation steps — used by the landing live-demo and /app/criar. */
export const GENERATION_STEPS: GenerationStep[] = [
  { id: "briefing", label: "Analisando briefing", durationMs: 1100 },
  { id: "direction", label: "Explorando direções visuais", durationMs: 1300 },
  { id: "palette", label: "Construindo paleta", durationMs: 1100 },
  { id: "typography", label: "Desenhando tipografia", durationMs: 1000 },
  { id: "symbol", label: "Gerando símbolo", durationMs: 1300 },
  { id: "applications", label: "Montando aplicações", durationMs: 1100 },
  { id: "final", label: "Finalizando sistema", durationMs: 900 },
];

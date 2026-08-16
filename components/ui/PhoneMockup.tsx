"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { VMark } from "./VMark";
import { EASE_EDITORIAL } from "@/lib/motion/easing";
import { cn } from "@/lib/utils";

const SCREENS = [
  { id: "briefing", label: "Briefing" },
  { id: "perguntas", label: "Perguntas" },
  { id: "processamento", label: "Processamento" },
  { id: "identidade", label: "Identidade gerada" },
  { id: "aplicacoes", label: "Aplicações" },
] as const;

function BriefingScreen() {
  return (
    <div className="flex h-full flex-col justify-between p-5">
      <div>
        <p className="text-[10px] uppercase tracking-[0.1em] text-neutral-400">Passo 1</p>
        <h4 className="mt-2 text-lg font-medium text-ink">Vamos criar sua marca.</h4>
      </div>
      <div className="space-y-3">
        <div className="rounded-[6px] border border-ink/10 bg-off-white px-3 py-2.5 text-[13px] text-neutral-500">
          Nome da marca
        </div>
        <div className="rounded-[6px] border border-ink/10 bg-off-white px-3 py-2.5 text-[13px] text-ink">
          Norte
        </div>
      </div>
      <div className="h-9 w-full rounded-[4px] bg-ink text-center text-[12px] font-medium leading-9 text-off-white">
        Continuar
      </div>
    </div>
  );
}

function PerguntasScreen() {
  const words = ["Moderna", "Minimalista", "Sofisticada"];
  return (
    <div className="flex h-full flex-col justify-between p-5">
      <div>
        <p className="text-[10px] uppercase tracking-[0.1em] text-neutral-400">Passo 2</p>
        <h4 className="mt-2 text-[15px] font-medium text-ink">
          Escolha palavras que representam sua marca.
        </h4>
      </div>
      <div className="flex flex-wrap gap-2">
        {words.map((word, i) => (
          <span
            key={word}
            className={cn(
              "rounded-full px-3 py-1.5 text-[12px] font-medium",
              i === 0 ? "bg-accent text-accent-ink" : "border border-ink/12 text-neutral-600"
            )}
          >
            {word}
          </span>
        ))}
      </div>
      <div className="h-9 w-full rounded-[4px] bg-ink text-center text-[12px] font-medium leading-9 text-off-white">
        Próxima
      </div>
    </div>
  );
}

function ProcessamentoScreen() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 p-5 text-center">
      <VMark variant="solid" size={44} tone="ink" progress={0.65} />
      <div>
        <p className="text-[13px] font-medium text-ink">Construindo paleta</p>
        <p className="mt-1 text-[11px] text-neutral-400">Analisando briefing e direções visuais</p>
      </div>
      <div className="h-[3px] w-32 overflow-hidden rounded-full bg-ink/8">
        <div className="h-full w-2/3 rounded-full bg-accent" />
      </div>
    </div>
  );
}

function IdentidadeScreen() {
  return (
    <div className="flex h-full flex-col justify-between p-5">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.1em] text-neutral-400">Sua identidade</p>
        <VMark variant="cropped" size={20} tone="ink" />
      </div>
      <div className="flex items-center gap-2">
        <VMark variant="solid" size={30} tone="ink" />
        <span className="text-xl font-semibold lowercase tracking-[-0.02em] text-ink">norte</span>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {["#17170F", "#F5F4EF", "#A8A79B", "#C6F13A"].map((hex) => (
          <div key={hex} className="h-8 rounded-[4px]" style={{ backgroundColor: hex }} />
        ))}
      </div>
    </div>
  );
}

function AplicacoesScreen() {
  return (
    <div className="grid h-full grid-cols-2 gap-1.5 p-3">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={cn(
            "flex items-center justify-center rounded-[6px]",
            i === 0 ? "bg-ink" : i === 3 ? "bg-accent" : "bg-off-white border border-ink/10"
          )}
        >
          <VMark
            variant={i === 1 ? "outline" : "mono"}
            size={18}
            tone={i === 0 ? "paper" : i === 3 ? "accent" : "ink"}
          />
        </div>
      ))}
    </div>
  );
}

const SCREEN_COMPONENTS = [
  BriefingScreen,
  PerguntasScreen,
  ProcessamentoScreen,
  IdentidadeScreen,
  AplicacoesScreen,
];

export function PhoneMockup({
  step,
  className,
}: {
  step?: number;
  className?: string;
}) {
  const [internalStep, setInternalStep] = useState(0);
  const isControlled = typeof step === "number";
  const activeStep = isControlled ? step : internalStep;

  useEffect(() => {
    if (isControlled) return;
    const id = setInterval(() => {
      setInternalStep((prev) => (prev + 1) % SCREEN_COMPONENTS.length);
    }, 2600);
    return () => clearInterval(id);
  }, [isControlled]);

  const ActiveScreen = SCREEN_COMPONENTS[((activeStep % SCREEN_COMPONENTS.length) + SCREEN_COMPONENTS.length) % SCREEN_COMPONENTS.length];

  return (
    <div className={cn("relative mx-auto w-[264px]", className)}>
      <div className="relative rounded-[2.75rem] border-[6px] border-ink bg-ink p-2 shadow-lifted">
        <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-ink" />
        <div className="relative aspect-[9/19.5] w-full overflow-hidden rounded-[2.25rem] bg-paper">
          <AnimatePresence mode="wait">
            <motion.div
              key={SCREENS[activeStep]?.id ?? activeStep}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.45, ease: EASE_EDITORIAL }}
              className="absolute inset-0"
            >
              {ActiveScreen && <ActiveScreen />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-center gap-1.5">
        {SCREENS.map((screen, i) => (
          <span
            key={screen.id}
            className={cn(
              "h-1 rounded-full transition-all duration-300",
              i === activeStep ? "w-5 bg-accent" : "w-1 bg-ink/15"
            )}
          />
        ))}
      </div>
    </div>
  );
}

"use client";

import { useId, type ReactNode } from "react";
import { V_MASK_PATH_NORMALIZED } from "@/lib/v-geometry";
import { cn } from "@/lib/utils";

interface VMaskProps {
  children: ReactNode;
  className?: string;
}

/** Clips arbitrary content (a color block, a composition) into the V silhouette — the "recorte" motif. */
export function VMask({ children, className }: VMaskProps) {
  const autoId = useId();
  const clipId = `vmask-${autoId.replace(/[:]/g, "")}`;

  return (
    <div className={cn("relative", className)}>
      <svg width={0} height={0} className="absolute" aria-hidden>
        <defs>
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            <path d={V_MASK_PATH_NORMALIZED} />
          </clipPath>
        </defs>
      </svg>
      <div className="h-full w-full" style={{ clipPath: `url(#${clipId})` }}>
        {children}
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { Prospector } from "@/components/prospect/Prospector";

export const metadata: Metadata = { title: "Prospectar" };

export default function ProspectarPage() {
  return (
    <Suspense fallback={null}>
      <Prospector />
    </Suspense>
  );
}

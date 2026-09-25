import type { Metadata } from "next";
import { Suspense } from "react";
import { Prospector } from "@/components/app/Prospector";

export const metadata: Metadata = { title: "Prospectar" };

export default function ProspectarPage() {
  return (
    <Suspense fallback={<div className="flex-1" />}>
      <Prospector />
    </Suspense>
  );
}

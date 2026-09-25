import type { Metadata } from "next";
import { FullMap } from "@/components/maps/FullMap";

export const metadata: Metadata = { title: "Mapa" };

export default function MapaPage() {
  return <FullMap />;
}

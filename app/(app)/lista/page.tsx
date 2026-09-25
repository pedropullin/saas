import type { Metadata } from "next";
import { LeadBoard } from "@/components/app/LeadBoard";

export const metadata: Metadata = { title: "Minha lista" };

export default function ListaPage() {
  return <LeadBoard />;
}

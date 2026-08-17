import type { ReactNode } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { ScrollProgress } from "@/components/landing/ScrollProgress";
import { Footer } from "@/components/layout/Footer";
import { PointerProvider } from "@/components/providers/PointerProvider";
import { CursorProvider } from "@/components/providers/CursorProvider";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <PointerProvider>
      <CursorProvider>
        <ScrollProgress />
        <Navbar />
        <main>{children}</main>
        <Footer />
      </CursorProvider>
    </PointerProvider>
  );
}

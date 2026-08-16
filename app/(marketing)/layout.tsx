import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CursorProvider } from "@/components/providers/CursorProvider";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <CursorProvider>
      <Header />
      <main>{children}</main>
      <Footer />
    </CursorProvider>
  );
}

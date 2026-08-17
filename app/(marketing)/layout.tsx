import type { ReactNode } from "react";
import { Header } from "@/components/afago/Header";
import { Footer } from "@/components/afago/Footer";
import { ScrollProgress } from "@/components/afago/ScrollProgress";
import { CursorProvider } from "@/components/providers/CursorProvider";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="afago-root">
      <CursorProvider>
        <ScrollProgress />
        <Header />
        <main>{children}</main>
        <Footer />
      </CursorProvider>
    </div>
  );
}

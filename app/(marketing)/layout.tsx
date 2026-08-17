import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { CursorProvider } from "@/components/providers/CursorProvider";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <CursorProvider>
      <Header />
      <main data-cursor-zone>{children}</main>
    </CursorProvider>
  );
}

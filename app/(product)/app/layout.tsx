import type { ReactNode } from "react";
import { ProductSidebar } from "@/components/product/ProductSidebar";
import { ProductTopbar } from "@/components/product/ProductTopbar";

export default function ProductLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-paper">
      <ProductSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <ProductTopbar />
        <main className="flex-1 px-5 py-8 md:px-10 md:py-10">{children}</main>
      </div>
    </div>
  );
}

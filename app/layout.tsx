import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Prospecta.ai — Prospecção com Google Maps e WhatsApp",
    template: "%s · Prospecta.ai",
  },
  description:
    "Encontre empresas de qualquer lugar do mundo no Google Maps, veja avaliações e chame no WhatsApp ou ligue em um clique.",
};

export const viewport: Viewport = {
  themeColor: "#070707",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}

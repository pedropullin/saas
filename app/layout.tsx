import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { MotionConfig } from "framer-motion";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "veyro — Crie marcas extraordinárias com inteligência.",
    template: "%s — veyro",
  },
  description:
    "A VEYRO transforma um briefing simples em uma identidade de marca completa: logotipo, símbolo, paleta, tipografia e brand book, pronta para crescer.",
  metadataBase: new URL("https://veyro.app"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </body>
    </html>
  );
}

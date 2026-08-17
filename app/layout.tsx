import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { MotionConfig } from "framer-motion";
import { TransitionProvider } from "@/components/providers/TransitionProvider";
import { LoadingIntro } from "@/components/experience/LoadingIntro";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "veyro — A próxima geração de criação de marcas.",
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
        <MotionConfig reducedMotion="user">
          <TransitionProvider>
            <LoadingIntro />
            {children}
          </TransitionProvider>
        </MotionConfig>
      </body>
    </html>
  );
}

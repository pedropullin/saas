import type { Metadata } from "next";
import { Sora } from "next/font/google";
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

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sora",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={sora.variable}>
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

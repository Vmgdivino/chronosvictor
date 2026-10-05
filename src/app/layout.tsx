import { AuthGate } from "@/components/auth-gate";
import { CinemaBackdrop } from "@/components/cinema-backdrop";
import { SiteHeader } from "@/components/site-header";
import { SceneProvider } from "@/context/scene-context";
import { WatchedProvider } from "@/context/watched-context";
import type { Metadata } from "next";
import { Outfit, Syne } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
});

export const metadata: Metadata = {
  title: {
    default: "ChronosVictor",
    template: "%s · ChronosVictor",
  },
  description:
    "Organize, explore e acompanhe cronologias de franquias de filmes na ordem da história.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${outfit.variable} ${syne.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-transparent">
        <WatchedProvider>
          <SceneProvider>
            <CinemaBackdrop />
            <div className="relative z-10 flex min-h-full flex-1 flex-col">
              <AuthGate>
                <SiteHeader />
                <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-20 pt-6 sm:px-6">{children}</main>
              </AuthGate>
            </div>
          </SceneProvider>
        </WatchedProvider>
      </body>
    </html>
  );
}

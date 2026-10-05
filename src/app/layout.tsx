import { AuthGate } from "@/components/auth-gate";
import { CinemaBackdrop } from "@/components/cinema-backdrop";
import { SiteHeader } from "@/components/site-header";
import { SoundtrackDock } from "@/components/soundtrack-dock";
import { AudioHost } from "@/context/sound-context";
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
    "Organize, explore e acompanhe cronologias de franquias, com filmes e séries na ordem da história.",
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
                <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-4 sm:px-6 sm:pb-28 sm:pt-6 lg:px-8">{children}</main>
                <AudioHost />
                <SoundtrackDock />
              </AuthGate>
            </div>
          </SceneProvider>
        </WatchedProvider>
      </body>
    </html>
  );
}

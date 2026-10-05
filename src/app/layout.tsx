import type { Metadata } from "next";
import { Outfit, Syne } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { WatchedProvider } from "@/context/watched-context";
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
      <body className="flex min-h-full flex-col">
        <WatchedProvider>
          <SiteHeader />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-20 pt-6 sm:px-6">{children}</main>
        </WatchedProvider>
      </body>
    </html>
  );
}

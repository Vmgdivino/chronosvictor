import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ChronosVictor",
    short_name: "ChronosVictor",
    description:
      "Organize, explore e acompanhe cronologias de franquias, com filmes e séries na ordem da história.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#08090d",
    theme_color: "#08090d",
    lang: "pt-BR",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

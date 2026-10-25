import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["msedge-tts", "ws"],
  async headers() {
    return [
      {
        source: "/models/cast/:file*",
        headers: [{ key: "Content-Type", value: "model/gltf-binary" }],
      },
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default nextConfig;

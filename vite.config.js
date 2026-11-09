import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["apple-touch-icon.png", "foundry-logo.png"],
      manifest: {
        name: "Foundry",
        short_name: "Foundry",
        description: "Where builders ship, hire and collaborate.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#FAF8F5",
        theme_color: "#A04622",
        icons: [
          { src: "/foundry-logo.png", sizes: "192x192", type: "image/png" },
          { src: "/foundry-logo.png", sizes: "512x512", type: "image/png" },
          { src: "/foundry-logo.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        navigateFallback: "/index.html",
        // never cache API calls: always fetch live data from the backend
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/api"),
            handler: "NetworkOnly",
          },
          {
            urlPattern: /^https:\/\/foundry-backend-ux47\.onrender\.com\/.*/i,
            handler: "NetworkOnly",
          },
        ],
      },
      devOptions: { enabled: true }, // lets you test install on localhost
    }),
  ],
});
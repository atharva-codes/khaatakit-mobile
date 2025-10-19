import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// ⚠️ Temporarily disable lovable-tagger to fix ESM issue
// import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // mode === "development" && componentTagger(), // ❌ Disabled for now
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico"],
      manifest: {
        name: "KhaataKitab - Vendor Bookkeeping",
        short_name: "KhaataKitab",
        description: "Smart bookkeeping app for small vendors",
        theme_color: "#2563eb",
        background_color: "#f0f4f8",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/favicon.ico",
            sizes: "64x64 32x32 24x24 16x16",
            type: "image/x-icon",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // ✅ Ignore lovable-tagger in dependency optimization
  optimizeDeps: {
    exclude: ["lovable-tagger"],
  },
}));

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { imagetools } from "vite-imagetools";

export default defineConfig({
  plugins: [react(), imagetools()],
  server: {
    port: 3002,
    proxy: {
      "/graphql": {
        target: "http://localhost:3005",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
});

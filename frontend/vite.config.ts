import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("recharts")) return "vendor-charts";
          if (id.includes("framer-motion")) return "vendor-motion";
          if (id.includes("react-router") || id.includes("/react/") || id.includes("/react-dom/")) {
            return "vendor-react";
          }
          if (id.includes("@tanstack") || id.includes("axios")) return "vendor-query";
          return "vendor";
        },
      },
    },
  },
})

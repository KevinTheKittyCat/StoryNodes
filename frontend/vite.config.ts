import path from "node:path"
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from "@vitejs/plugin-react-swc"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"
import viteReact from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tanstackRouter(), viteReact(), tsconfigPaths()],
  test: {
    globals: true,
    environment: "jsdom",
  },
  resolve: {

    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})

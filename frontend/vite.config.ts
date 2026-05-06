import { tanstackRouter } from '@tanstack/router-plugin/vite'
import viteReact from "@vitejs/plugin-react"
import path from "node:path"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

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
      "@ui": path.resolve(__dirname, "./src/components/ui"),
    },
  },
})

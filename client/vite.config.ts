import { defineConfig } from 'vite'
import * as path from "node:path";
import react from '@vitejs/plugin-react'
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), wasm(), topLevelAwait()],
  build: {
    target: "esnext",
    rollupOptions: {
        // Ensure external modules are properly handled
        external: ["chalk"],
        output: {
            format: "esm",
        },
    },
},
resolve: {
  alias: {
      "@": path.resolve(__dirname, "./src"),
  },
},

})

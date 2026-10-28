import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  root: resolve(__dirname, "pilot"),
  build: {
    outDir: resolve(__dirname, "dist-motor-journey"),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        shell: resolve(__dirname, "pilot/shell/index.html"),
        ccr: resolve(__dirname, "pilot/ccr/index.html"),
        mama: resolve(__dirname, "pilot/mama/index.html"),
      },
    },
  },
});

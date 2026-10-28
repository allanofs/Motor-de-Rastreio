import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  root: resolve(__dirname, "pilot/shell"),
  build: {
    outDir: resolve(__dirname, "dist-shell-pilot"),
    emptyOutDir: true,
  },
});

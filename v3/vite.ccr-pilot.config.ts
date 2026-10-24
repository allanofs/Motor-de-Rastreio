import { defineConfig } from "vite";

export default defineConfig({
  root: "pilot/ccr",
  build: {
    outDir: "../../dist-ccr-pilot",
    emptyOutDir: true,
  },
  server: {
    host: "127.0.0.1",
  },
});

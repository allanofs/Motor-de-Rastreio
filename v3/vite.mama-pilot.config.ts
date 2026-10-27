import { defineConfig } from "vite";

export default defineConfig({
  root: "pilot/mama",
  build: {
    outDir: "../../dist-mama-pilot",
    emptyOutDir: true,
  },
  server: {
    host: "127.0.0.1",
  },
});

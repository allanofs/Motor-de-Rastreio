import { defineConfig } from "vite";

export default defineConfig({
  root: "pilot/ccr",
  plugins: [
    {
      name: "motor-shared-context-bootstrap",
      transformIndexHtml() {
        return [{
          tag: "script",
          attrs: { type: "module", src: "/sharedContextBootstrap.ts" },
          injectTo: "body-prepend",
        }];
      },
    },
  ],
  build: {
    outDir: "../../dist-ccr-pilot",
    emptyOutDir: true,
  },
  server: {
    host: "127.0.0.1",
  },
});

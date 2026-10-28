import { defineConfig } from "vite";

export default defineConfig({
  root: "pilot/mama",
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
    outDir: "../../dist-mama-pilot",
    emptyOutDir: true,
  },
  server: {
    host: "127.0.0.1",
  },
});

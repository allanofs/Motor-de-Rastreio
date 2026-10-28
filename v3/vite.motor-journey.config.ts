import { defineConfig } from "vite";
import { resolve } from "node:path";

const rootDir = import.meta.dirname;

export default defineConfig({
  root: resolve(rootDir, "pilot"),
  plugins: [
    {
      name: "motor-integrated-shared-context-bootstraps",
      transformIndexHtml(_html, context) {
        if (context.path.includes("/ccr/")) {
          return [{
            tag: "script",
            attrs: { type: "module", src: "/ccr/sharedContextBootstrap.ts" },
            injectTo: "body-prepend",
          }];
        }
        if (context.path.includes("/mama/")) {
          return [{
            tag: "script",
            attrs: { type: "module", src: "/mama/sharedContextBootstrap.ts" },
            injectTo: "body-prepend",
          }];
        }
        return [];
      },
    },
  ],
  build: {
    outDir: resolve(rootDir, "dist-motor-journey"),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        shell: resolve(rootDir, "pilot/shell/index.html"),
        ccr: resolve(rootDir, "pilot/ccr/index.html"),
        mama: resolve(rootDir, "pilot/mama/index.html"),
      },
    },
  },
});

import { defineConfig } from "vite";
import { resolve } from "node:path";

const rootDir = import.meta.dirname;

function appendModuleScript(html: string, src: string): string {
  return html.replace(
    "</body>",
    `    <script type="module" src="${src}"></script>\n  </body>`,
  );
}

export default defineConfig({
  root: resolve(rootDir, "pilot"),
  plugins: [
    {
      name: "motor-integrated-shared-context-bootstraps",
      transformIndexHtml: {
        order: "pre",
        handler(html, context) {
          if (context.path.includes("/ccr/")) {
            return appendModuleScript(html, "/ccr/sharedContextBootstrap.ts");
          }
          if (context.path.includes("/mama/")) {
            return appendModuleScript(html, "/mama/sharedContextBootstrap.ts");
          }
          return html;
        },
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

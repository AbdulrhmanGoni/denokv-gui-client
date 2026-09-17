import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type PluginOption } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import path from "node:path";

function htmlTitlePlugin(): PluginOption {
  return {
    name: "html-title-transform",
    transformIndexHtml(html) {
      const variant = process.env.APP_VARIANT;
      const suffix = variant && variant !== "stable" ? ` (${variant})` : "";
      return html.replace(
        /<title>.*?<\/title>/,
        `<title>Deno KV GUI Client${suffix}</title>`,
      );
    },
  };
}

export default defineConfig({
  plugins: [
    tailwindcss(),
    svelte({
      compilerOptions: {
        warningFilter: (warning) => warning.code !== "state_referenced_locally",
      },
    }),
    htmlTitlePlugin(),
  ],
  resolve: {
    alias: {
      $lib: path.resolve(import.meta.dirname, "./src/lib"),
    },
  },
  build: {
    minify: process.env.DEBUG === "true" ? false : "oxc",
    sourcemap: true,
    reportCompressedSize: false,
    rolldownOptions: {
      output: {
        sourcemapExcludeSources: true,
      },
    },
  },
});

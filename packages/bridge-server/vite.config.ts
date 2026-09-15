import { defineConfig, type PluginOption } from "vite";
import { resolve } from "path";
import dts from "unplugin-dts/vite";
import { findRendererWatchServer } from "@app/dev/vite";

export default defineConfig({
  build: {
    outDir: "dist",
    target: "node18",
    lib: {
      entry: {
        index: resolve(import.meta.dirname, "src/index.ts"),
        "kv-utils": resolve(import.meta.dirname, "src/kv-utils.ts"),
        client: resolve(import.meta.dirname, "src/server/bridgeServerClient.ts"),
      },
      formats: ["es"],
      fileName: (_format, entryName) => `${entryName}.mjs`,
    },
    rolldownOptions: {
      external: ["@deno/kv", /^node:.*/],
      output: {
        preserveModules: false,
        exports: "named",
      },
    },
    emptyOutDir: true,
    reportCompressedSize: false,
    minify: process.env.DEBUG === "true" ? false : "oxc",
  },
  plugins: [
    dts({
      include: ["src/**/*"],
    }),
    handleHotReload(),
  ],
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "src"),
    },
  },
});

/** Implement Electron webview reload when some file change in the bridge-server package */
function handleHotReload(): PluginOption {
  let rendererWatchServer: import("vite").ViteDevServer | null = null;

  return {
    name: "@app/bridge-server-hot-reload",
    config(config, env) {
      if (env.mode !== "development") return;

      rendererWatchServer = findRendererWatchServer(config);

      return { build: { watch: {} } };
    },
    writeBundle() {
      if (!rendererWatchServer) return;

      rendererWatchServer.ws.send({ type: "full-reload" });
    },
  };
}

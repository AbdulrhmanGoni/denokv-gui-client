import { resolveModuleExportNames } from "mlly";
import { getChromeMajorVersion } from "@app/electron-versions";
import { defineConfig, type PluginOption, type ViteDevServer } from "vite";
import { findRendererWatchServer } from "@app/dev/vite";

export default defineConfig({
  build: {
    ssr: true,
    sourcemap: "inline",
    minify: process.env.DEBUG === "true" ? false : "oxc",
    outDir: "dist",
    target: `chrome${getChromeMajorVersion()}`,
    assetsDir: ".",
    lib: {
      entry: ["src/exposed.ts", "virtual:browser.js"],
      formats: ["es"],
    },
    rolldownOptions: {
      output: {
        // ESM preload scripts must have the .mjs extension
        entryFileNames: "[name].mjs",
        sourcemapExcludeSources: true,
      },
      external: ["@app/bridge-server", "electron"],
    },
    emptyOutDir: true,
    reportCompressedSize: false,
  },
  plugins: [mockExposed(), handleHotReload()],
});

/**
 * This plugin creates a browser (renderer) version of `preload` package. Basically, it
 * just reads all exported nominals from `preload` package and defines them as globalThis
 * properties.
 */
function mockExposed(): PluginOption {
  const virtualModuleId = "virtual:browser.js";
  const resolvedVirtualModuleId = "\0" + virtualModuleId;

  return {
    name: "electron-main-exposer",
    resolveId(id) {
      if (id.endsWith(virtualModuleId)) {
        return resolvedVirtualModuleId;
      }
    },
    async load(id) {
      if (id === resolvedVirtualModuleId) {
        const exportedNames = await resolveModuleExportNames("./src/index.ts", {
          url: import.meta.url,
        });
        return exportedNames.reduce((s, key) => {
          return (
            s +
            (key === "default"
              ? `export default globalThis['${key}'];\n`
              : `export const ${key} = globalThis['${key}'];\n`)
          );
        }, "");
      }
    },
  };
}

/** Implement Electron webview reload when some file was changed */
function handleHotReload(): PluginOption {
  let rendererWatchServer: ViteDevServer | null = null;

  return {
    name: "@app/preload-process-hot-reload",
    config(config, env) {
      if (env.mode !== "development") {
        return;
      }

      rendererWatchServer = findRendererWatchServer(config);

      return { build: { watch: {} } };
    },
    writeBundle() {
      if (!rendererWatchServer) return;

      rendererWatchServer.ws.send({ type: "full-reload" });
    },
  };
}

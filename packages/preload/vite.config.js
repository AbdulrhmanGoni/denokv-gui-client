import { resolveModuleExportNames } from "mlly";
import { getChromeMajorVersion } from "@app/electron-versions";

export default /**
 * @type {import('vite').UserConfig}
 * @see https://vitejs.dev/config/
 */
({
  build: {
    ssr: true,
    sourcemap: "inline",
    outDir: "dist",
    target: `chrome${getChromeMajorVersion()}`,
    assetsDir: ".",
    lib: {
      entry: ["src/exposed.ts", "virtual:browser.js"],
    },
    rollupOptions: {
      output: [
        {
          // ESM preload scripts must have the .mjs extension
          // https://www.electronjs.org/docs/latest/tutorial/esm#esm-preload-scripts-must-have-the-mjs-extension
          entryFileNames: "[name].mjs",
        },
      ],
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
function mockExposed() {
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

/**
 * Implement Electron webview reload when some file was changed
 *
 * @returns {import("vite").Plugin}
 */
function handleHotReload() {
  /** @type {import("vite").ViteDevServer | null} */
  let rendererWatchServer = null;

  return {
    name: "@app/preload-process-hot-reload",

    config(config, env) {
      if (env.mode !== "development") {
        return;
      }

      const rendererWatchServerProvider = config.plugins.find(
        (p) => p.name === "@app/renderer-watch-server-provider",
      );
      if (!rendererWatchServerProvider) {
        throw new Error("Renderer watch server provider not found");
      }

      rendererWatchServer = rendererWatchServerProvider.api.provideRendererWatchServer();

      return {
        build: {
          watch: {},
        },
      };
    },

    writeBundle() {
      if (!rendererWatchServer) {
        return;
      }

      rendererWatchServer.ws.send({
        type: "full-reload",
      });
    },
  };
}

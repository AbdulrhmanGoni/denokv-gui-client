import { getNodeMajorVersion } from "@app/electron-versions";
import { spawn } from "child_process";
import electronPath from "electron";
import { resolve } from "node:path";
import { cpSync, writeFileSync } from "node:fs";
import { extractLastReleaseChangelog } from "../../scripts/extractLastReleaseChangelog.ts";
import { marked } from "marked";

export default /**
 * @type {import('vite').UserConfig}
 * @see https://vitejs.dev/config/
 */
({
  ssr: {
    noExternal: ["@std/async", "electron-updater"],
    external: true,
  },
  build: {
    ssr: true,
    outDir: "dist",
    assetsDir: ".",
    target: `node${getNodeMajorVersion()}`,
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
    },
    rollupOptions: {
      output: {
        entryFileNames: "[name].js",
      },
    },
    emptyOutDir: true,
    reportCompressedSize: false,
    minify: process.env.DEBUG === "true" ? false : "oxc",
  },
  plugins: [handleHotReload(), copyMigrations(), bundleReleaseNotes()],
});

function bundleReleaseNotes() {
  return {
    name: "bundle-release-notes",
    async closeBundle() {
      const changelog = await extractLastReleaseChangelog(
        resolve(import.meta.dirname, "../../CHANGELOG.md"),
      );
      const changelogHtml = await marked.parse(changelog);

      writeFileSync(
        `${resolve(import.meta.dirname, "dist")}/RELEASE_NOTES.html`,
        changelogHtml,
      );
    },
  };
}

function copyMigrations() {
  return {
    name: "copy-migrations",
    closeBundle() {
      const distPath = resolve(import.meta.dirname, "dist");
      cpSync(
        resolve(import.meta.dirname, "src/db/migrations"),
        `${distPath}/migrations`,
        {
          recursive: true,
        },
      );
    },
  };
}

/**
 * Implement Electron app reload when some file was changed
 *
 * @returns {import("vite").Plugin}
 */
function handleHotReload() {
  /** @type {ChildProcess} */
  let electronApp = null;

  /** @type {import("vite").ViteDevServer | null} */
  let rendererWatchServer = null;

  return {
    name: "@app/main-process-hot-reload",

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

      process.env.VITE_DEV_SERVER_URL = rendererWatchServer.resolvedUrls.local[0];

      return {
        build: {
          watch: {},
        },
      };
    },

    writeBundle() {
      if (process.env.NODE_ENV !== "development") {
        return;
      }

      /** Kill electron if a process already exists */
      if (electronApp !== null) {
        electronApp.removeListener("exit", process.exit);
        electronApp.kill("SIGINT");
        electronApp = null;
      }

      /** Spawn a new electron process */
      electronApp = spawn(String(electronPath), ["--inspect", "."], {
        stdio: "inherit",
      });

      /** Stops the watch script when the application has been quit */
      electronApp.addListener("exit", process.exit);
    },
  };
}

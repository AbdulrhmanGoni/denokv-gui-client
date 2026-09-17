import { getNodeMajorVersion } from "@app/electron-versions";
import { spawn } from "child_process";
import electronPath from "electron";
import { resolve } from "node:path";
import { cpSync, writeFileSync } from "node:fs";
import { extractLastReleaseChangelog } from "../../scripts/extractLastReleaseChangelog.ts";
import { defineConfig, type PluginOption, type ViteDevServer } from "vite";
import { marked } from "marked";
import packageJson from "../../package.json" with { type: "json" };
import type { ChildProcess } from "node:child_process";
import { findRendererWatchServer } from "@app/dev/vite";

export default defineConfig({
  ssr: {
    noExternal: ["@std/async", "electron-updater"],
    external: true,
  },
  define: {
    APP_VERSION: `"${packageJson.version}"`,
    APP_GITHUB_REPO: `"${packageJson.repository.url}"`,
    APP_VARIANT: `"${process.env.APP_VARIANT || "stable"}"`,
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
    rolldownOptions: {
      output: {
        entryFileNames: "[name].js",
      },
      external: ["@app/bridge-server"],
    },
    emptyOutDir: true,
    reportCompressedSize: false,
    minify: process.env.DEBUG === "true" ? false : "oxc",
  },
  plugins: [handleHotReload(), copyMigrations(), bundleReleaseNotes()],
});

function bundleReleaseNotes(): PluginOption {
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

function copyMigrations(): PluginOption {
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

/** Implement Electron app reload when some file was changed */
function handleHotReload(): PluginOption {
  let electronApp: ChildProcess | null = null;

  let rendererWatchServer: ViteDevServer | null = null;

  return {
    name: "@app/main-process-hot-reload",
    config(config, env) {
      if (env.mode !== "development") {
        return;
      }

      rendererWatchServer = findRendererWatchServer(config);

      process.env.VITE_DEV_SERVER_URL = rendererWatchServer.resolvedUrls?.local[0];

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

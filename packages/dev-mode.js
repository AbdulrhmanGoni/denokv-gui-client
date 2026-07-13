import { build, createServer } from "vite";
import path from "path";

const mode = "development";
process.env.NODE_ENV = mode;
process.env.MODE = mode;

/**
 * A development server for the renderer. This server should be started first because
 * other packages depend on its settings.
 */
/** @type {import("vite").ViteDevServer} */
const rendererWatchServer = await createServer({
  mode,
  root: path.resolve("packages/renderer"),
});

await rendererWatchServer.listen();

/**
 * A simple provider plugin to provide access to the renderer dev-server to all other
 * build processes.
 */
/** @type {import("vite").Plugin} */
const rendererWatchServerProvider = {
  name: "@app/renderer-watch-server-provider",
  api: {
    provideRendererWatchServer() {
      return rendererWatchServer;
    },
  },
};

/**
 * Building all other packages. For each of them, we add a plugin provider so that each
 * package can implement its own hot update mechanism.
 */

/** @type {string[]} */
const packagesToStart = ["packages/bridge-server", "packages/preload", "packages/main"];

for (const pkg of packagesToStart) {
  await build({
    mode,
    root: path.resolve(pkg),
    plugins: [rendererWatchServerProvider],
  });
}

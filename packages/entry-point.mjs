import { initApp } from "@app/main";
import { fileURLToPath } from "node:url";

if (
  process.env.NODE_ENV === "development" ||
  process.env.PLAYWRIGHT_TEST === "true" ||
  !!process.env.CI
) {
  function showAndExit(...args) {
    console.error(...args);
    process.exit(1);
  }

  process.on("uncaughtException", showAndExit);
  process.on("unhandledRejection", showAndExit);
}

initApp({
  renderer:
    process.env.MODE === "development" && !!process.env.VITE_DEV_SERVER_URL
      ? new URL(process.env.VITE_DEV_SERVER_URL)
      : {
          path: fileURLToPath(import.meta.resolve("@app/renderer")),
        },

  preload: {
    path: fileURLToPath(import.meta.resolve("@app/preload/exposed.mjs")),
  },
});

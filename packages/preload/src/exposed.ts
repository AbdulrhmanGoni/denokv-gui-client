import * as exported from "./index.js";
import { contextBridge } from "electron";

const exports = exported;

const isExport = (key: string): key is keyof typeof exports =>
  Object.hasOwn(exports, key);

for (const exportsKey in exports) {
  if (isExport(exportsKey)) {
    contextBridge.exposeInMainWorld(exportsKey, exports[exportsKey]);
  }
}

// Re-export for tests
export * from "./index.js";

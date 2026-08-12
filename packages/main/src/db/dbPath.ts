import os from "node:os";
import path from "node:path";
import fs from "node:fs";

function getAppDataPath(appName: string) {
  const home = os.homedir();
  const platform = process.platform;

  if (platform === "win32") {
    const localAppData = process.env.LOCALAPPDATA || process.env.APPDATA;
    if (localAppData) return path.join(localAppData, appName);
    return path.join(home, "AppData", "Local");
  }

  if (platform === "darwin") {
    return path.join(home, "Library", "Application Support", appName);
  }

  const xdgData = path.join(home, ".local", "share");
  return path.join(xdgData, appName);
}

export function getDatabasePath() {
  if (process.env.NODE_ENV == "development") {
    return "./database.dev.sqlite";
  }

  if (process.env.PLAYWRIGHT_TEST == "true") {
    return "./tests/database.test.sqlite";
  }

  const dbDir =
    process.env.DENOKV_GUI_CLIENT_DB_DIR || getAppDataPath("denokv-gui-client");

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  return path.join(dbDir, "kv-stores-database.sqlite");
}

import { versions } from "node:process";
import path from "node:path";
import fs from "node:fs";
import { ipcMain } from "electron";
import pkg from "../../../../package.json" with { type: "json" };
import { syncTrycatch } from "../helpers.js";
import type { AppMetadata, TrycatchResult } from "../types.ts";

class AppInfoService {
  constructor(
    private readonly app: Electron.App,
    private readonly appMetaData: AppMetadata,
  ) {}

  async getMetadata() {
    return this.appMetaData;
  }

  async getReleaseNotes(): Promise<TrycatchResult<string>> {
    return syncTrycatch(() => {
      const releaseNotesPath = path.join(import.meta.dirname, "RELEASE_NOTES.html");
      return fs.readFileSync(releaseNotesPath, "utf-8");
    });
  }

  async isHardwareAccelerationEnabled(): Promise<TrycatchResult<boolean>> {
    return syncTrycatch(() => this.app.isHardwareAccelerationEnabled());
  }
}

export type AppInfoServiceInterface = Pick<
  AppInfoService,
  "getMetadata" | "getReleaseNotes" | "isHardwareAccelerationEnabled"
>;

export class AppInfoModule {
  readonly metadata: AppMetadata;

  constructor(app: Electron.App) {
    this.metadata = {
      appVersion: pkg.version,
      nodeVersion: versions.node,
      electronVersion: versions.electron,
      chromiumVersion: versions.chrome,
      githubRepo: pkg.homepage,
      environment:
        process.env.PLAYWRIGHT_TEST === "true"
          ? "testing"
          : process.env.NODE_ENV === "development"
            ? "development"
            : "production",
    };

    const service = new AppInfoService(app, this.metadata);

    ipcMain.handle("appInfoService:getMetadata", (_event) => {
      return service.getMetadata();
    });

    ipcMain.handle("appInfoService:getReleaseNotes", (_event) => {
      return service.getReleaseNotes();
    });

    ipcMain.handle("appInfoService:isHardwareAccelerationEnabled", (_event) => {
      return service.isHardwareAccelerationEnabled();
    });
  }
}

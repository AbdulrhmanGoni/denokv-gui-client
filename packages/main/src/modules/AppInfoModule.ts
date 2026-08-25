import { versions } from "node:process";
import path from "node:path";
import fs from "node:fs";
import { ipcMain } from "electron";
import pkg from "../../../../package.json" with { type: "json" };
import type { AppModule, ModuleContext } from "./types.js";
import { syncTrycatch } from "../helpers.js";
import type { AppMetadata, TrycatchResult } from "../types.ts";

export const appVersion = pkg.version;
export const nodeVersion = versions.node;
export const electronVersion = versions.electron;
export const chromiumVersion = versions.chrome;
export const githubRepo = pkg.homepage;
export const environment =
  process.env.PLAYWRIGHT_TEST === "true"
    ? "testing"
    : process.env.NODE_ENV === "development"
      ? "development"
      : "production";

class AppInfoService {
  constructor(private readonly context: ModuleContext) {}

  async getMetadata(): Promise<AppMetadata> {
    return {
      appVersion,
      nodeVersion,
      electronVersion,
      chromiumVersion,
      githubRepo,
      environment,
    };
  }

  async getReleaseNotes(): Promise<TrycatchResult<string>> {
    return syncTrycatch(() => {
      const releaseNotesPath = path.join(import.meta.dirname, "RELEASE_NOTES.html");
      return fs.readFileSync(releaseNotesPath, "utf-8");
    });
  }

  async isHardwareAccelerationEnabled(): Promise<TrycatchResult<boolean>> {
    return syncTrycatch(() => this.context.app.isHardwareAccelerationEnabled());
  }
}

export type AppInfoServiceInterface = Pick<
  AppInfoService,
  "getMetadata" | "getReleaseNotes" | "isHardwareAccelerationEnabled"
>;

export class AppInfoModule implements AppModule {
  constructor() {}

  async enable(context: ModuleContext): Promise<void> {
    const service = new AppInfoService(context);

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

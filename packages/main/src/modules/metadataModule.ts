import { ipcMain } from "electron";
import type { AppModule, ModuleContext } from "./types.js";
import pkg from "../../../../package.json" with { type: "json" };
import { versions } from "node:process";

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

export interface MetadataInterface {
  getMetadata(): Promise<AppMetadata>;
}

export class MetadataModule implements AppModule {
  enable(_context: ModuleContext): void {
    const getMetadata: MetadataInterface["getMetadata"] = async () => ({
      appVersion,
      nodeVersion,
      electronVersion,
      chromiumVersion,
      githubRepo,
      environment,
    });

    ipcMain.handle("get-metadata", getMetadata);
  }
}

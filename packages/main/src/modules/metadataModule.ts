import { ipcMain } from "electron";
import type { AppModule, ModuleContext } from "./types.js";
import pkg from "../../../../package.json" with { type: "json" };
import { versions } from "node:process";
import fs from "node:fs";
import path from "node:path";

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
  getCurrentVersionReleaseNotes(): Promise<string>;
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

    const getCurrentVersionReleaseNotes: MetadataInterface["getCurrentVersionReleaseNotes"] =
      async () => {
        const releaseNotesPath = path.join(import.meta.dirname, "RELEASE_NOTES.html");
        try {
          const releaseNotes = fs.readFileSync(releaseNotesPath, "utf-8");
          return releaseNotes;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          return `<p>Error while reading release notes for v${appVersion}: ${errorMessage}</p>`;
        }
      };

    ipcMain.handle("get-current-version-release-notes", getCurrentVersionReleaseNotes);
  }
}

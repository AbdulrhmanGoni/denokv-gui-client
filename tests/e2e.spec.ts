import type { ConsoleMessage, ElectronApplication } from "playwright";
import { _electron as electron } from "playwright";
import { test as base } from "@playwright/test";
import getCompiledAppPath from "./getCompiledAppPath";
import { mainWindowTests } from "./mainWindowTests";
import { preloadContextExposureToRendererTests } from "./preloadContextExposureToRendererTests";
import { rmSync } from "node:fs";
import path from "node:path";
import { kvStoresTests } from "./kvStoresTests";
import { kvEntriesTests } from "./kvEntriesTests";
import { filteringKvEntriesTests } from "./filteringKvEntriesTests";
import { atomicOperationsTests } from "./atomicOperationsTests";
import { watchedKeysTests } from "./watchedKeysTests";

process.env.PLAYWRIGHT_TEST = "true";

type TestFixtures = {
  electronApp: ElectronApplication;
};

export const test = base.extend<TestFixtures>({
  electronApp: [
    // oxlint-disable-next-line no-empty-pattern
    async ({}, use) => {
      const electronApp = await electron.launch({
        executablePath: getCompiledAppPath(),
        args: ["--no-sandbox"],
      });

      electronApp.on("console", (msg) => {
        if (msg.type() === "error") {
          console.error(`[electron][${msg.type()}] ${msg.text()}`);
        }
      });

      await use(electronApp);
    },
    { scope: "worker", auto: true } as any,
  ],

  page: async ({ electronApp }, use, testInfo) => {
    const page = await electronApp.firstWindow();

    try {
      await page.context().tracing.start({
        screenshots: true,
        snapshots: true,
        sources: true,
      });
    } catch {}

    const consoleListener = (msg: ConsoleMessage) => {
      console.log(`[console][${msg.type()}]: ${msg.text()}`);
    };
    const pageErrorListener = (error: Error) => {
      console.error(`[page-error]: ${error}`);
    };

    page.on("pageerror", pageErrorListener);
    page.on("console", consoleListener);

    await page.waitForLoadState("load");
    page.setDefaultTimeout(9000);
    await use(page);

    page.off("pageerror", pageErrorListener);
    page.off("console", consoleListener);

    try {
      if (testInfo.status !== "passed") {
        const tracePath = testInfo.outputPath("trace.zip");
        await page.context().tracing.stop({ path: tracePath });
        testInfo.attachments.push({
          name: "trace",
          path: tracePath,
          contentType: "application/zip",
        });
      } else {
        await page.context().tracing.stop();
      }
    } catch {}
  },
});

export const testingKvStore = {
  name: "Testing Kv Store",
  path: import.meta.dirname,
};

const testDatabaseFilePath = path.resolve(import.meta.dirname, "./database.test.sqlite");

test.afterAll(async ({ electronApp }) => {
  await electronApp.close();

  rmSync(testDatabaseFilePath, { force: true });

  const testingKvStorePath = path.resolve(testingKvStore.path, "kv.sqlite3");
  rmSync(testingKvStorePath, { force: true });
  rmSync(`${testingKvStorePath}-shm`, { force: true });
  rmSync(`${testingKvStorePath}-wal`, { force: true });
});

test("Main window state", mainWindowTests);

test.describe(
  "Preload context exposure to renderer tests",
  preloadContextExposureToRendererTests,
);

test.describe("Kv Stores Tests", kvStoresTests);

test.describe("Kv Entries Tests", kvEntriesTests);

test.describe("Filtering Kv Entries Tests", filteringKvEntriesTests);

test.describe("Watched Keys Tests", watchedKeysTests);

test.describe("Atomic Operations Tests", atomicOperationsTests);

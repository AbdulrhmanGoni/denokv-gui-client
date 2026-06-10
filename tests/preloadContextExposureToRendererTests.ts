import { test } from "./e2e.spec";
import { expect } from "@playwright/test";

export function preloadContextExposureToRendererTests() {
  test("'metadata' should be exposed as an object", async ({ page }) => {
    const metadata = await page.evaluate(
      () => globalThis["metadata" as keyof typeof globalThis],
    );
    expect(typeof metadata).toEqual("object");

    const versionMatching = /\d+.\d+.\d+/;
    expect(metadata).toEqual({
      githubRepo: expect.stringMatching(/https:\/\/github.com\/\w/),
      appVersion: expect.stringMatching(versionMatching),
      electronVersion: expect.stringMatching(versionMatching),
      chromiumVersion: expect.stringMatching(/\d+.\d+.\d+.\d+/),
      nodeVersion: expect.stringMatching(versionMatching),
      environment: expect.stringMatching(/testing|development|production/),
    });
  });

  test(`'kvStoresService' should be exposed as an object with its methods`, async ({
    page,
  }) => {
    const kvStoresService = await page.evaluate(
      () => globalThis["kvStoresService" as keyof typeof globalThis],
    );
    expect(typeof kvStoresService).toEqual("object");

    const exposedMethods = Object.keys(kvStoresService);
    const targetMethods = [
      "create",
      "update",
      "getAll",
      "deleteOne",
      "renameDefaultLocalKvStore",
      "testKvStoreConnection",
    ];

    expect(exposedMethods.length).toBe(targetMethods.length);
    targetMethods.forEach((method) => expect(exposedMethods).toContain(method));
  });

  test(`'kvClient' should be exposed as an object with its methods`, async ({
    page,
  }) => {
    const kvClient = await page.evaluate(
      () => globalThis["kvClient" as keyof typeof globalThis],
    );
    expect(typeof kvClient).toEqual("object");

    const exposedMethods = Object.keys(kvClient);
    const targetMethods = [
      "browse",
      "set",
      "deleteKey",
      "get",
      "enqueue",
      "atomic",
      "watch",
      "cancelWatcher",
    ];

    expect(exposedMethods.length).toBe(targetMethods.length);
    targetMethods.forEach((method) => expect(exposedMethods).toContain(method));
  });

  test(`'bridgeServer' should be exposed as an object with its methods`, async ({
    page,
  }) => {
    const bridgeServer = await page.evaluate(
      () => globalThis["bridgeServer" as keyof typeof globalThis],
    );
    expect(typeof bridgeServer).toEqual("object");

    const exposedMethods = Object.keys(bridgeServer);
    const targetMethods = ["openServer", "closeServer"];

    expect(exposedMethods.length).toBe(targetMethods.length);
    targetMethods.forEach((method) => expect(exposedMethods).toContain(method));
  });

  test(`'appUpdater' should be exposed as an object with its methods`, async ({
    page,
  }) => {
    const appUpdater = await page.evaluate(
      () => globalThis["appUpdater" as keyof typeof globalThis],
    );
    expect(typeof appUpdater).toEqual("object");

    const exposedMethods = Object.keys(appUpdater);
    const targetMethods = [
      "checkForUpdate",
      "downloadUpdate",
      "cancelUpdate",
      "onDownloadingUpdateProgress",
      "quitAndInstallUpdate",
    ];

    expect(exposedMethods.length).toBe(targetMethods.length);
    targetMethods.forEach((method) => expect(exposedMethods).toContain(method));
  });

  test(`'settingsService' should be exposed as an object with its methods`, async ({
    page,
  }) => {
    const settingsService = await page.evaluate(
      () => globalThis["settingsService" as keyof typeof globalThis],
    );
    expect(typeof settingsService).toEqual("object");

    const exposedMethods = Object.keys(settingsService);
    const targetMethods = ["getSettings", "updateSettings"];

    expect(exposedMethods.length).toBe(targetMethods.length);
    targetMethods.forEach((method) => expect(exposedMethods).toContain(method));
  });

  test(`'lastFetchedUpdateService' should be exposed as an object with its methods`, async ({
    page,
  }) => {
    const lastFetchedUpdateService = await page.evaluate(
      () => globalThis["lastFetchedUpdateService" as keyof typeof globalThis],
    );
    expect(typeof lastFetchedUpdateService).toEqual("object");

    const exposedMethods = Object.keys(lastFetchedUpdateService);
    const targetMethods = [
      "getLastFetchedUpdate",
      "setLastFetchedUpdate",
      "deleteLastFetchedUpdate",
      "doNotNotifyLastFetchedUpdate",
    ];

    expect(exposedMethods.length).toBe(targetMethods.length);
    targetMethods.forEach((method) => expect(exposedMethods).toContain(method));
  });

  test(`'browsingParamsService' should be exposed as an object with its methods`, async ({
    page,
  }) => {
    const browsingParamsService = await page.evaluate(
      () => globalThis["browsingParamsService" as keyof typeof globalThis],
    );
    expect(typeof browsingParamsService).toEqual("object");

    const exposedMethods = Object.keys(browsingParamsService);
    const targetMethods = [
      "saveBrowsingParams",
      "getSavedBrowsingParamsRecords",
      "getDefaultSavedBrowsingParams",
      "updateSavedBrowsingParams",
      "deleteSavedBrowsingParams",
    ];

    expect(exposedMethods.length).toBe(targetMethods.length);
    targetMethods.forEach((method) => expect(exposedMethods).toContain(method));
  });

  test(`'watchedKeysService' should be exposed as an object with its methods`, async ({
    page,
  }) => {
    const watchedKeysService = await page.evaluate(
      () => globalThis["watchedKeysService" as keyof typeof globalThis],
    );
    expect(typeof watchedKeysService).toEqual("object");

    const exposedMethods = Object.keys(watchedKeysService);
    const targetMethods = ["setWatchedKeys", "getWatchedKeys"];

    expect(exposedMethods.length).toBe(targetMethods.length);
    targetMethods.forEach((method) => expect(exposedMethods).toContain(method));
  });

  test(`'fileSystemService' should be exposed as an object with its methods`, async ({
    page,
  }) => {
    const fileSystemService = await page.evaluate(
      () => globalThis["fileSystemService" as keyof typeof globalThis],
    );
    expect(typeof fileSystemService).toEqual("object");

    const exposedMethods = Object.keys(fileSystemService);
    const targetMethods = [
      "selectDirectory",
      "selectFile",
      "openPath",
      "pathUtils",
    ];

    expect(exposedMethods.length).toBe(targetMethods.length);
    targetMethods.forEach((method) => expect(exposedMethods).toContain(method));

    // Check pathUtils methods
    const pathUtils = (fileSystemService as any).pathUtils;
    expect(typeof pathUtils).toEqual("object");
    const pathUtilsMethods = Object.keys(pathUtils);
    const targetPathUtilsMethods = ["dirname", "basename", "join"];
    expect(pathUtilsMethods.length).toBe(targetPathUtilsMethods.length);
    targetPathUtilsMethods.forEach((method) =>
      expect(pathUtilsMethods).toContain(method),
    );
  });
}

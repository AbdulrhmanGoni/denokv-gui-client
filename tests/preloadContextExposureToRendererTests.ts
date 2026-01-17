import { test } from "./e2e.spec";
import { expect } from '@playwright/test';

export function preloadContextExposureToRendererTests() {
    test("'versions' should be exposed as an object", async ({ page }) => {
        const versions = await page.evaluate(() => globalThis[btoa('versions') as keyof typeof globalThis]);
        expect(typeof versions).toEqual('object');

        const versionMatching = /\d+.\d+.\d+/
        expect(versions).toEqual({
            appGithubRepo: expect.stringMatching(/https:\/\/github.com\/\w/),
            appVersion: expect.stringMatching(versionMatching),
            electronVersion: expect.stringMatching(versionMatching),
            nodeVersion: expect.stringMatching(versionMatching),
        });
    });

    test(`'kvStoresService' should be exposed as an object with its methods`, async ({ page }) => {
        const kvStoresService = await page.evaluate(() => globalThis[btoa('kvStoresService') as keyof typeof globalThis]);
        expect(typeof kvStoresService).toEqual('object');

        const exposedMethods = Object.keys(kvStoresService)
        const targetMethods = [
            "create",
            "update",
            "getAll",
            "deleteOne",
            "renameDefaultLocalKvStore",
            "testKvStoreConnection",
        ]

        expect(exposedMethods.length).toBe(targetMethods.length)
        targetMethods.forEach((method) => expect(exposedMethods).toContain(method))
    });

    test(`'kvClient' should be exposed as an object with its methods`, async ({ page }) => {
        const kvClient = await page.evaluate(() => globalThis[btoa('kvClient') as keyof typeof globalThis]);
        expect(typeof kvClient).toEqual('object');

        const exposedMethods = Object.keys(kvClient)
        const targetMethods = ['browse', 'set', 'deleteKey', 'get', 'enqueue'];

        expect(exposedMethods.length).toBe(targetMethods.length);
        targetMethods.forEach((method) => expect(exposedMethods).toContain(method));
    });

    test(`'bridgeServer' should be exposed as an object with its methods`, async ({ page }) => {
        const bridgeServer = await page.evaluate(
            () => globalThis[btoa('bridgeServer') as keyof typeof globalThis]
        );
        expect(typeof bridgeServer).toEqual('object');

        const exposedMethods = Object.keys(bridgeServer)
        const targetMethods = ['openServer', 'closeServer', 'getServerClient'];

        expect(exposedMethods.length).toBe(targetMethods.length);
        targetMethods.forEach((method) => expect(exposedMethods).toContain(method));
    });

    test(`'appUpdater' should be exposed as an object with its methods`, async ({ page }) => {
        const appUpdater = await page.evaluate(
            () => globalThis[btoa('appUpdater') as keyof typeof globalThis]
        );
        expect(typeof appUpdater).toEqual('object');

        const exposedMethods = Object.keys(appUpdater)
        const targetMethods = [
            'checkForUpdate',
            'downloadUpdate',
            'cancelUpdate',
            'onDownloadingUpdateProgress',
            'quitAndInstallUpdate',
        ];

        expect(exposedMethods.length).toBe(targetMethods.length);
        targetMethods.forEach((method) => expect(exposedMethods).toContain(method));
    });

    test(`'settingsService' should be exposed as an object with its methods`, async ({ page }) => {
        const settingsService = await page.evaluate(
            () => globalThis[btoa('settingsService') as keyof typeof globalThis]
        );
        expect(typeof settingsService).toEqual('object');

        const exposedMethods = Object.keys(settingsService)
        const targetMethods = ['getSettings', 'updateSettings'];

        expect(exposedMethods.length).toBe(targetMethods.length);
        targetMethods.forEach((method) => expect(exposedMethods).toContain(method));
    });

    test(`'lastFetchedUpdateService' should be exposed as an object with its methods`, async ({ page }) => {
        const lastFetchedUpdateService = await page.evaluate(
            () => globalThis[btoa('lastFetchedUpdateService') as keyof typeof globalThis]
        );
        expect(typeof lastFetchedUpdateService).toEqual('object');

        const exposedMethods = Object.keys(lastFetchedUpdateService)
        const targetMethods = ['getLastFetchedUpdate', 'setLastFetchedUpdate', 'deleteLastFetchedUpdate'];

        expect(exposedMethods.length).toBe(targetMethods.length);
        targetMethods.forEach((method) => expect(exposedMethods).toContain(method));
    });

    test(`'browsingParamsService' should be exposed as an object with its methods`, async ({ page }) => {
        const browsingParamsService = await page.evaluate(
            () => globalThis[btoa('browsingParamsService') as keyof typeof globalThis]
        );
        expect(typeof browsingParamsService).toEqual('object');

        const exposedMethods = Object.keys(browsingParamsService)
        const targetMethods = [
            'saveBrowsingParams',
            'getSavedBrowsingParamsRecords',
            'getDefaultSavedBrowsingParams',
            'updateSavedBrowsingParams',
            'deleteSavedBrowsingParams',
        ];

        expect(exposedMethods.length).toBe(targetMethods.length);
        targetMethods.forEach((method) => expect(exposedMethods).toContain(method));
    });

    test.describe('Utility preload functions should be exposed', async () => {
        const utilExports = ['selectDirectory', 'openPath', 'onWindowReady'];

        utilExports.forEach((exportName) => {
            test(`'${exportName}' is exposed as a function`, async ({ page }) => {
                const type = await page.evaluate(
                    (key) => typeof globalThis[btoa(key) as keyof typeof globalThis],
                    exportName,
                );
                expect(type).toEqual('function');
            });
        });
    });
}

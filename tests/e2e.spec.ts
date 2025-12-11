import type { ElectronApplication, JSHandle } from 'playwright';
import { _electron as electron } from 'playwright';
import { expect, test as base } from '@playwright/test';
import type { BrowserWindow } from 'electron';
import { globSync } from 'glob';
import { platform } from 'node:process';

process.env.PLAYWRIGHT_TEST = 'true';

// Declare the types of your fixtures.
type TestFixtures = {
  electronApp: ElectronApplication;
};

const test = base.extend<TestFixtures>({
  electronApp: [async ({ }, use) => {

    /**
     * Executable path depends on root package name!
     */
    let executablePattern = 'dist/*/denokv-gui-client{,.*}';
    if (platform === 'darwin') {
      executablePattern += '/Contents/*/denokv-gui-client';
    }

    const [executablePath] = globSync(executablePattern);
    if (!executablePath) {
      throw new Error('App Executable path not found');
    }

    const electronApp = await electron.launch({
      executablePath: executablePath,
      args: ['--no-sandbox'],
    });

    electronApp.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error(`[electron][${msg.type()}] ${msg.text()}`);
      }
    });

    await use(electronApp);

    // This code runs after all the tests in the worker process.
    await electronApp.close();
  }, { scope: 'worker', auto: true } as any],

  page: async ({ electronApp }, use) => {
    const page = await electronApp.firstWindow();
    // capture errors
    page.on('pageerror', (error) => {
      console.error(error);
    });
    // capture console messages
    page.on('console', (msg) => {
      console.log(msg.text());
    });

    await page.waitForLoadState('load');
    await use(page);
  },
});

test('Main window state', async ({ electronApp, page }) => {
  const window: JSHandle<BrowserWindow> = await electronApp.browserWindow(page);
  const windowState = await window.evaluate(
    (mainWindow): Promise<{ isVisible: boolean; isDevToolsOpened: boolean; isCrashed: boolean }> => {
      const getState = () => ({
        isVisible: mainWindow.isVisible(),
        isDevToolsOpened: mainWindow.webContents.isDevToolsOpened(),
        isCrashed: mainWindow.webContents.isCrashed(),
      });

      return new Promise(resolve => {
        /**
         * The main window is created hidden, and is shown only when it is ready.
         * See {@link ../packages/main/src/mainWindow.ts} function
         */
        if (mainWindow.isVisible()) {
          resolve(getState());
        } else {
          mainWindow.once('ready-to-show', () => resolve(getState()));
        }
      });
    },
  );

  expect(windowState.isCrashed, 'The app has crashed').toEqual(false);
  expect(windowState.isVisible, 'The main window was not visible').toEqual(true);
  expect(windowState.isDevToolsOpened, 'The DevTools panel was open').toEqual(false);
});

test.describe('Preload context should be exposed', async () => {
  test.describe(`'versions' should be exposed`, async () => {
    test('with same type`', async ({ page }) => {
      const type = await page.evaluate(() => typeof globalThis[btoa('versions')]);
      expect(type).toEqual('object');
    });

    test('with same value', async ({ page }) => {
      const value = await page.evaluate(() => globalThis[btoa('versions')]);
      const versionMatching = /\d+.\d+.\d+/
      expect(value).toEqual({
        appGithubRepo: expect.stringMatching(/https:\/\/github.com\/\w/),
        appVersion: expect.stringMatching(versionMatching),
        electronVersion: expect.stringMatching(versionMatching),
        nodeVersion: expect.stringMatching(versionMatching),
      });
    });
  });

  test.describe(`'kvStoresService' should be exposed`, async () => {
    test('with same type`', async ({ page }) => {
      const type = await page.evaluate(() => typeof globalThis[btoa('kvStoresService')]);
      expect(type).toEqual('object');
    });

    test('with same methods', async ({ page }) => {
      const kvStoresService = await page.evaluate(() => globalThis[btoa('kvStoresService')]);
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
  });

  test.describe(`'kvClient' should be exposed`, async () => {
    test('with same methods', async ({ page }) => {
      const exposedMethods = await page.evaluate(() => Object.keys(globalThis[btoa('kvClient')]));
      const targetMethods = ['browse', 'set', 'deleteKey', 'get'];

      expect(exposedMethods.length).toBe(targetMethods.length);
      targetMethods.forEach((method) => expect(exposedMethods).toContain(method));
    });
  });

  test.describe(`'bridgeServer' should be exposed`, async () => {
    test('with same methods', async ({ page }) => {
      const exposedMethods = await page.evaluate(() => Object.keys(globalThis[btoa('bridgeServer')]));
      const targetMethods = ['openServer', 'closeServer', 'getServerClient'];

      expect(exposedMethods.length).toBe(targetMethods.length);
      targetMethods.forEach((method) => expect(exposedMethods).toContain(method));
    });
  });

  test.describe(`'appUpdater' should be exposed`, async () => {
    test('with same methods', async ({ page }) => {
      const exposedMethods = await page.evaluate(() => Object.keys(globalThis[btoa('appUpdater')]));
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
  });

  test.describe(`'settingsService' should be exposed`, async () => {
    test('with same methods', async ({ page }) => {
      const exposedMethods = await page.evaluate(() => Object.keys(globalThis[btoa('settingsService')]));
      const targetMethods = ['getSettings', 'updateSettings'];

      expect(exposedMethods.length).toBe(targetMethods.length);
      targetMethods.forEach((method) => expect(exposedMethods).toContain(method));
    });
  });

  test.describe(`'lastFetchedUpdateService' should be exposed`, async () => {
    test('with same methods', async ({ page }) => {
      const exposedMethods = await page.evaluate(
        () => Object.keys(globalThis[btoa('lastFetchedUpdateService')]),
      );
      const targetMethods = ['getLastFetchedUpdate', 'setLastFetchedUpdate', 'deleteLastFetchedUpdate'];

      expect(exposedMethods.length).toBe(targetMethods.length);
      targetMethods.forEach((method) => expect(exposedMethods).toContain(method));
    });
  });

  test.describe(`'browsingParamsService' should be exposed`, async () => {
    test('with same methods', async ({ page }) => {
      const exposedMethods = await page.evaluate(
        () => Object.keys(globalThis[btoa('browsingParamsService')]),
      );
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
  });

  test.describe('Utility preload functions should be exposed', async () => {
    const utilExports = ['selectDirectory', 'openPath', 'onWindowReady'] as const;

    utilExports.forEach((exportName) => {
      test(`'${exportName}' is exposed as a function`, async ({ page }) => {
        const type = await page.evaluate(
          (key) => typeof globalThis[btoa(key as string)],
          exportName,
        );
        expect(type).toEqual('function');
      });
    });
  });
});

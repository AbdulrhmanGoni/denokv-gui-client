import type { ElectronApplication } from 'playwright';
import { _electron as electron } from 'playwright';
import { test as base } from '@playwright/test';
import { globSync } from 'glob';
import { platform } from 'node:process';
import { mainWindowTests } from './mainWindowTests';
import { preloadContextExposureToRendererTests } from './preloadContextExposureToRendererTests';
import { rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { kvStoresTests } from './kvStoresTests';
import { kvEntriesTests } from './kvEntriesTests';

process.env.PLAYWRIGHT_TEST = 'true';

type TestFixtures = {
  electronApp: ElectronApplication;
};

export const test = base.extend<TestFixtures>({
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

export const testingKvStore = {
  name: 'Testing Kv Store',
  path: import.meta.dirname,
}

test.afterAll(async ({ electronApp }) => {
  await electronApp.close();

  writeFileSync(path.resolve(import.meta.dirname, './database.test.sqlite'), "")

  const testingKvStorePath = path.resolve(testingKvStore.path, 'kv.sqlite3')
  rmSync(testingKvStorePath, { force: true })
  rmSync(`${testingKvStorePath}-shm`, { force: true })
  rmSync(`${testingKvStorePath}-wal`, { force: true })
})

test('Main window state', mainWindowTests)

test.describe('Preload context exposure to renderer tests', preloadContextExposureToRendererTests)

test.describe('Kv Stores Tests', kvStoresTests)

test.describe('Kv Entries Tests', kvEntriesTests)

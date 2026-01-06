import type { ElectronApplication } from 'playwright';
import { _electron as electron } from 'playwright';
import { test as base } from '@playwright/test';
import { globSync } from 'glob';
import { platform } from 'node:process';
import { mainWindowTests } from './mainWindowTests';
import { preloadContextExposureToRendererTests } from './preloadContextExposureToRendererTests';

process.env.PLAYWRIGHT_TEST = 'true';

// Declare the types of your fixtures.
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

test('Main window state', mainWindowTests)

test.describe('Preload context exposure to renderer tests', preloadContextExposureToRendererTests)

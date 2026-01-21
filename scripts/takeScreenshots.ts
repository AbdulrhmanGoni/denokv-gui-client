import { _electron as electron } from 'playwright';
import type { Page } from 'playwright';
import { globSync } from 'glob';
import { platform } from 'node:process';
import sharp from "sharp";
import { readdirSync, rmSync, writeFileSync } from 'node:fs';
import { randomTestingKvEntries } from '../tests/testingKvEntries.ts';
import path from 'node:path';

process.env.PLAYWRIGHT_TEST = 'true';

let executablePattern = 'dist/*/denokv-gui-client{,.*}';
if (platform === 'darwin') {
    executablePattern += '/Contents/*/denokv-gui-client';
}

const [executablePath] = globSync(executablePattern);
if (!executablePath) {
    throw new Error('App Executable path not found. Please compile the app first using: npm run compile');
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

try {
    const page = await electronApp.firstWindow();

    // Capture errors
    page.on('pageerror', (error) => {
        console.error('Page error:', error);
    });

    // Wait for the page to load
    await page.waitForLoadState('load');

    await page.evaluate(async (path) => {
        const kvStoresService = globalThis[btoa('kvStoresService') as keyof typeof globalThis]
        await kvStoresService.create({
            name: "Some Local KV Store",
            url: path,
            type: "local",
            accessToken: null,
            authToken: null,
        })

        await kvStoresService.create({
            name: "Some Production KV Store",
            url: "https://some-remote-database.com/kv",
            type: "remote",
            accessToken: "some-access-token",
            authToken: null,
        })

        await kvStoresService.create({
            name: "Some KV Store Bridge Server",
            url: "https://localhost:8704/kv/bridge-server",
            type: "bridge",
            accessToken: null,
            authToken: "some-auth-token",
        })
    }, import.meta.dirname);

    await switchMode(page, 'dark')
    await takeScreenshots(page, 'dark')
    await switchMode(page, 'light')
    await takeScreenshots(page, 'light')
} finally {
    await electronApp.close();

    writeFileSync(path.resolve(import.meta.dirname, '../tests/database.test.sqlite'), "")

    const testingKvStorePath = path.resolve(import.meta.dirname, 'kv.sqlite3')
    rmSync(testingKvStorePath, { force: true })
    rmSync(`${testingKvStorePath}-shm`, { force: true })
    rmSync(`${testingKvStorePath}-wal`, { force: true })

    for (const file of readdirSync("./screenshots")) {
        if (file.endsWith(".temp.png")) {
            await sharp("./screenshots/" + file)
                .png({ quality: 70 })
                .toFile("./screenshots/" + file.replace(".temp", ""));

            rmSync("./screenshots/" + file)
        }
    }
}

type Mode = "dark" | "light";

async function takeScreenshots(page: Page, mode: Mode) {
    const steps = [
        takeScreenshotOfKvStoresGrid,
        takeScreenshotOfKvStoreForm,
        takeScreenshotOfKvEntriesTable,
        takeScreenshotOfDisplayKvEntryDialog,
        takeScreenshotOfEditKvEntryDialog,
        takeScreenshotOfAddKvEntryForm,
        takeScreenshotOfLookupEntryDialog,
        takeScreenshotOfBrowsingParamsDialog,
        takeScreenshotOfSavedBrowsingParamsDialog,
        takeScreenshotOfEnqueueMessageDialog,
    ]

    for (const step of steps) {
        await step(page, mode)
    }
}

async function switchMode(page: Page, mode: Mode) {
    const settingsButton = page.locator("button svg.lucide-settings");
    await settingsButton.click()

    const lightModeButton = page.locator(`button svg.lucide-${mode == "dark" ? "moon" : "sun"}`);
    await lightModeButton.click()

    await page.screenshot({ path: `./screenshots/SettingsPage_${mode}.temp.png`, fullPage: true });

    await page.reload();
}

async function takeScreenshotOfKvStoresGrid(page: Page, mode: Mode) {
    await page.screenshot({ path: `./screenshots/KvStoresGrid_${mode}.temp.png`, fullPage: true });
}

async function takeScreenshotOfKvStoreForm(page: Page, mode: Mode) {
    const addKvStoreButton = page.locator('button', { hasText: "Add Kv Store" });
    await addKvStoreButton.click();
    await page.screenshot({ path: `./screenshots/KvStoreForm_${mode}.temp.png`, fullPage: true });
    const backButton = page.locator("button", { hasText: "Back" });
    await backButton.click()
}

async function takeScreenshotOfKvEntriesTable(page: Page, mode: Mode) {
    await page.locator(
        '#kv-stores-grid > div',
        { hasText: "Some Local KV Store" }
    ).dblclick({ position: { x: 5, y: 5 } });

    await page.evaluate(async (entries) => {
        const kvClient = globalThis[btoa('kvClient') as keyof typeof globalThis]

        if (!(await kvClient.get(entries[0].key))?.result) {
            for (const entry of entries) {
                await kvClient.set(entry.key, entry.value)
            }
        }
    }, randomTestingKvEntries);

    await page.locator("button", { hasText: "Reload" }).click();
    await page.waitForTimeout(100)
    await page.screenshot({ path: `./screenshots/KvEntriesTable_${mode}.temp.png`, fullPage: true });
}

async function takeScreenshotOfDisplayKvEntryDialog(page: Page, mode: Mode) {
    await page.locator('td', { hasText: /"admins"/ }).dblclick({ position: { x: 5, y: 5 } });
    await page.waitForTimeout(100);
    await page.screenshot({ path: `./screenshots/DisplayKvEntryDialog_${mode}.temp.png`, fullPage: true });
}

async function takeScreenshotOfEditKvEntryDialog(page: Page, mode: Mode) {
    await page.locator('button', { hasText: "Edit Entry" }).click();
    await page.locator('button', { has: page.locator("svg.lucide-chevron-down"), hasText: "Object" }).click();
    await page.waitForTimeout(100);
    await page.screenshot({ path: `./screenshots/EditKvEntryDialog_${mode}.temp.png`, fullPage: true });
    await page.keyboard.press('Escape');
    await page.keyboard.press('Escape');
}

async function takeScreenshotOfAddKvEntryForm(page: Page, mode: Mode) {
    await page.locator('button', { hasText: "Add Entry" }).click();
    await page.waitForTimeout(100);
    await page.locator('button', { has: page.locator("svg.lucide-chevron-down"), hasText: "Undefined" }).click();
    await page.waitForTimeout(100);
    await page.screenshot({ path: `./screenshots/AddKvEntryForm_${mode}.temp.png`, fullPage: true });
    await page.keyboard.press('Escape');
    await page.keyboard.press('Escape');
}

async function takeScreenshotOfLookupEntryDialog(page: Page, mode: Mode) {
    await page.locator('button', { hasText: "Look up Entry" }).click();
    await page.waitForTimeout(100);
    await page.screenshot({ path: `./screenshots/LookupEntryDialog_${mode}.temp.png`, fullPage: true });
    await page.keyboard.press('Escape');
}

async function takeScreenshotOfBrowsingParamsDialog(page: Page, mode: Mode) {
    await page.locator('button', { has: page.locator("svg.lucide-pencil-line") }).click();
    await page.waitForTimeout(100);
    await page.screenshot({ path: `./screenshots/BrowsingParamsDialog_${mode}.temp.png`, fullPage: true });
}

async function takeScreenshotOfSavedBrowsingParamsDialog(page: Page, mode: Mode) {
    await page.evaluate(async () => {
        const kvStoresService = globalThis[btoa('kvStoresService') as keyof typeof globalThis]
        const store = (await kvStoresService.getAll()).find((store: any) => store.type === "local")

        const browsingParamsService = globalThis[btoa('browsingParamsService') as keyof typeof globalThis]

        const res = await browsingParamsService.getSavedBrowsingParamsRecords(store.id)
        if (res.result.length) {
            return
        }

        await browsingParamsService.saveBrowsingParams(store.id, {
            browsingParams: {
                prefix: '["orders", "failed"]',
                start: "[]",
                end: "[]",
                limit: 50,
                batchSize: 50,
                consistency: "string",
                reverse: false
            },
            setAsDefault: false
        })
    });

    await page.locator('button', { hasText: "Saved Filters List" }).click();
    await page.waitForTimeout(100);
    await page.screenshot({ path: `./screenshots/SavedBrowsingParamsDialog_${mode}.temp.png`, fullPage: true });
    await page.keyboard.press('Escape');
}

async function takeScreenshotOfEnqueueMessageDialog(page: Page, mode: Mode) {
    await page.locator('button', { hasText: "Enqueue Message" }).click();
    await page.waitForTimeout(100);
    const valueEditor = page.locator('div#value-editor')
    await valueEditor.fill('{task: "delete-files-task", files: ["file-id-1", "file-id-2", "file-id-3"]}')
    await valueEditor.press('Space')
    await page.locator('button', { has: page.locator('svg.lucide-scan-text') }).click();
    await page.waitForTimeout(100)

    await page.locator('div', { has: page.locator('> p', { hasText: "Backoff Schedule" }) })
        .locator("button")
        .click();
    await page.waitForTimeout(100);

    const backoffScheduleEditor = page.locator('div#backoff-schedule-editor');
    await backoffScheduleEditor.fill('[5000, 20000, 40000]');
    await backoffScheduleEditor.press('Space');
    await page.waitForTimeout(100)
    await page.screenshot({ path: `./screenshots/EnqueueMessageBackoffScheduleOption_${mode}.temp.png`, fullPage: true });
    await page.locator("button", { hasText: "Set Option" }).click();

    await page.locator('div', { has: page.locator('> p', { hasText: "Keys If Undelivered" }) })
        .locator("button")
        .click();
    await page.waitForTimeout(100);

    const keysIfUndeliveredEditor = page.locator('div#keys-if-undelivered-editor');
    await keysIfUndeliveredEditor.fill('[["undelivered", "delete-files-task"]]');
    await keysIfUndeliveredEditor.press('Space');
    await page.screenshot({ path: `./screenshots/EnqueueMessageKeysIfUndeliveredOption_${mode}.temp.png`, fullPage: true });
    await page.locator("button", { hasText: "Set Option" }).click();
    await page.waitForTimeout(100);

    await page.waitForTimeout(125);
    await page.screenshot({ path: `./screenshots/EnqueueMessageDialog_${mode}.temp.png`, fullPage: true });
    await page.keyboard.press('Escape');
}

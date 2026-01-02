import { _electron as electron } from 'playwright';
import type { Page } from 'playwright';
import { globSync } from 'glob';
import { platform } from 'node:process';
import sharp from "sharp";
import { readdirSync, rmSync } from 'node:fs';

process.env.PLAYWRIGHT_TEST = 'true';
process.env.NODE_ENV = 'development';

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

    await switchMode(page, 'dark')
    await takeScreenshots(page, 'dark')
    await switchMode(page, 'light')
    await takeScreenshots(page, 'light')
} finally {
    await electronApp.close();
}

type Mode = "dark" | "light";

async function takeScreenshots(page: Page, mode: Mode) {
    const steps = [
        takeScreenshotOfKvStoresGrid,
        takeScreenshotOfKvEntriesTable,
        takeScreenshotOfDisplayKvEntryDialog,
        takeScreenshotOfAddKvEntryForm,
        takeScreenshotOfLookupEntryDialog,
        takeScreenshotOfBrowsingParamsDialog,
        takeScreenshotOfSavedBrowsingParamsDialog,
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

    const backButton = page.locator("button svg.lucide-arrow-left");
    await backButton.click()
}

async function takeScreenshotOfKvStoresGrid(page: Page, mode: Mode) {
    await page.screenshot({ path: `./screenshots/KvStoresGrid_${mode}.temp.png`, fullPage: true });
}

async function takeScreenshotOfKvEntriesTable(page: Page, mode: Mode) {
    const kvStoreCard = page.locator('#kv-stores-grid > div', { has: page.locator("svg.lucide-file") }).first();
    await kvStoreCard.dblclick({ position: { x: 5, y: 5 } });
    await page.screenshot({ path: `./screenshots/KvEntriesTable_${mode}.temp.png`, fullPage: true });
}

async function takeScreenshotOfDisplayKvEntryDialog(page: Page, mode: Mode) {
    const c = page.locator('td', { hasText: "settings" });
    await c.dblclick({ position: { x: 5, y: 5 } });
    await page.waitForTimeout(100)
    await page.screenshot({ path: `./screenshots/DisplayKvEntryDialog_${mode}.temp.png`, fullPage: true });
    const closeButton = page.locator('button', { has: page.locator("svg.lucide-x"), hasText: "close" });
    await closeButton.click();
}

async function takeScreenshotOfAddKvEntryForm(page: Page, mode: Mode) {
    const addKvEntryButton = page.locator('button', { hasText: "Add Entry" });
    await addKvEntryButton.click();
    await page.waitForTimeout(100);
    const dataTypesSelectBox = page.locator('button', { has: page.locator("svg.lucide-chevron-down"), hasText: "Undefined" });
    await dataTypesSelectBox.click();
    await page.waitForTimeout(100);
    await page.screenshot({ path: `./screenshots/AddKvEntryForm_${mode}.temp.png`, fullPage: true });
    await page.keyboard.press('Escape');
    await page.keyboard.press('Escape');
}

async function takeScreenshotOfLookupEntryDialog(page: Page, mode: Mode) {
    const lookupEntryButton = page.locator('button', { hasText: "Look up Entry" });
    await lookupEntryButton.click();
    await page.waitForTimeout(100);
    await page.screenshot({ path: `./screenshots/LookupEntryDialog_${mode}.temp.png`, fullPage: true });
    await page.keyboard.press('Escape');
}

async function takeScreenshotOfBrowsingParamsDialog(page: Page, mode: Mode) {
    const openFiltersButton = page.locator('button', { hasText: "Filter" });
    await openFiltersButton.click();
    await page.waitForTimeout(100);
    await page.screenshot({ path: `./screenshots/BrowsingParamsDialog_${mode}.temp.png`, fullPage: true });
    await page.keyboard.press('Escape');
}

async function takeScreenshotOfSavedBrowsingParamsDialog(page: Page, mode: Mode) {
    const openSavedBrowsingParamsButton = page.locator(
        'button',
        {
            has: page.locator("svg.lucide-book-marked"),
            hasNot: page.locator("button"),
        }
    );
    await openSavedBrowsingParamsButton.click();
    await page.waitForTimeout(100);
    await page.screenshot({ path: `./screenshots/SavedBrowsingParamsDialog_${mode}.temp.png`, fullPage: true })
    await page.keyboard.press('Escape');
}

for (const file of readdirSync("./screenshots")) {
    if (file.endsWith(".png")) {
        await sharp("./screenshots/" + file)
            .png({ quality: 70 })
            .toFile("./screenshots/" + file.replace(".temp", ""));

        rmSync("./screenshots/" + file)
    }
}

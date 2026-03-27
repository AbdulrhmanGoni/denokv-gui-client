import path from "node:path";
import { test, testingKvStore } from "./e2e.spec";
import { expect } from '@playwright/test';
import { mkdirSync, rmSync } from "node:fs";

export function kvStoresTests() {
    const anotherNewKvStore = {
        name: "Another Testing Kv Store",
        path: path.join(import.meta.dirname, "another-kv"),
    }

    const customFileName = "custom-test.db";

    test.beforeAll(() => {
        mkdirSync(anotherNewKvStore.path)
    });

    test.afterAll(() => {
        rmSync(anotherNewKvStore.path, { recursive: true, force: true })
        const customFilePath = path.resolve(testingKvStore.path, customFileName);
        rmSync(customFilePath, { force: true });
        rmSync(`${customFilePath}-shm`, { force: true });
        rmSync(`${customFilePath}-wal`, { force: true });
    });

    test('Create local Kv Stores', async ({ page }) => {
        const addKvStoreButton = page.locator('button', { hasText: "Add Kv Store" })
        const nameInput = page.locator("input#name");
        const typeSelectButton = page.locator('button', { hasText: "Select Type" })
        const localTypeSelectItem = page.locator('div[data-slot="select-item"]', { hasText: "local" })
        const localKvDirectoryInput = page.locator("input#localKvDirectory");
        const submitButton = page.locator('button[type=submit]');

        // Create the first new kv store
        await addKvStoreButton.click();
        await nameInput.fill(testingKvStore.name);
        await typeSelectButton.click();
        await localTypeSelectItem.click();
        await localKvDirectoryInput.fill(testingKvStore.path);
        await submitButton.click();

        const iconLocator = page.locator("svg.lucide-hard-drive")

        const newKvStoreCard = page.locator('#kv-stores-grid > div', {
            has: iconLocator,
            hasText: testingKvStore.name
        })

        await expect(newKvStoreCard.locator("p", { hasText: testingKvStore.name })).toHaveText(testingKvStore.name);

        // Create the other new kv store
        await addKvStoreButton.click();
        await nameInput.fill(anotherNewKvStore.name);
        await typeSelectButton.click();
        await localTypeSelectItem.click();
        await localKvDirectoryInput.fill(anotherNewKvStore.path);
        await submitButton.click();

        const anotherNewKvStoreCard = page.locator('#kv-stores-grid > div', {
            has: iconLocator,
            hasText: anotherNewKvStore.name
        })
        await expect(anotherNewKvStoreCard.locator("p", { hasText: anotherNewKvStore.name })).toHaveText(anotherNewKvStore.name);
    });

    test('Update the name of the new Kv Store', async ({ page }) => {
        const newKvStoreCard = page.locator('#kv-stores-grid > div', {
            has: page.locator("svg.lucide-hard-drive"),
            hasText: testingKvStore.name,
            hasNotText: anotherNewKvStore.name,
        });

        await newKvStoreCard.locator(
            'button[data-slot="dropdown-menu-trigger"]',
            { has: page.locator("svg.lucide-ellipsis-vertical") }
        ).click();
        await page.locator('div[data-slot="dropdown-menu-item"]', { hasText: "Edit" }).click();
        await page.locator("input#name").fill(`${testingKvStore.name} (Renamed)`);
        await page.locator('button[type=submit]').click();

        const newKvStoreName = newKvStoreCard.locator("p", { hasText: testingKvStore.name })
        await expect(newKvStoreName).toHaveText(`${testingKvStore.name} (Renamed)`);
    });

    test('Delete a Kv Store', async ({ page }) => {
        const anotherNewKvStoreCard = page.locator('#kv-stores-grid > div', {
            has: page.locator("svg.lucide-hard-drive"),
            hasText: anotherNewKvStore.name
        })

        await anotherNewKvStoreCard.locator(
            'button[data-slot="dropdown-menu-trigger"]',
            { has: page.locator("svg.lucide-ellipsis-vertical") }
        ).click()
        await page.locator('div[data-slot="dropdown-menu-item"]', { hasText: "Delete" }).click()
        await page.locator('button[data-slot="alert-dialog-action"]', { hasText: "Delete" }).click();

        await expect(anotherNewKvStoreCard).not.toBeVisible();
    });

    test('Create a remote Kv Store', async ({ page }) => {
        const remoteKvStore = {
            name: "Remote Test Store",
            url: "https://remote-test.example.com",
            accessToken: "test-access-token"
        }

        const addKvStoreButton = page.locator('button', { hasText: "Add Kv Store" })
        const nameInput = page.locator("input#name");
        const typeSelectButton = page.locator('button', { hasText: "Select Type" })
        const remoteTypeSelectItem = page.locator('div[data-slot="select-item"]', { hasText: "remote" })
        const urlInput = page.locator("input#url");
        const accessTokenInput = page.locator("input#accessToken");
        const submitButton = page.locator('button[type=submit]');

        await addKvStoreButton.click();
        await nameInput.fill(remoteKvStore.name);
        await typeSelectButton.click();
        await remoteTypeSelectItem.click();
        await urlInput.fill(remoteKvStore.url);
        await accessTokenInput.fill(remoteKvStore.accessToken);
        await submitButton.click();

        const globeIcon = page.locator("svg.lucide-globe")

        await expect(page.locator('#kv-stores-grid > div', {
            has: globeIcon,
            hasText: remoteKvStore.name
        })).toBeVisible();
        await expect(page.locator('#kv-stores-grid > div', {
            has: globeIcon,
            hasText: remoteKvStore.url
        })).toBeVisible();
    });

    test('Create a bridge Kv Store', async ({ page }) => {
        const bridgeKvStore = {
            name: "Bridge Test Store",
            url: "http://localhost:9999",
            authToken: "bridge-test-token"
        }

        const addKvStoreButton = page.locator('button', { hasText: "Add Kv Store" })
        const nameInput = page.locator("input#name");
        const typeSelectButton = page.locator('button', { hasText: "Select Type" })
        const bridgeTypeSelectItem = page.locator('div[data-slot="select-item"]', { hasText: "bridge" })
        const urlInput = page.locator("input#url");
        const authTokenInput = page.locator("input#authToken");
        const submitButton = page.locator('button[type=submit]');

        await addKvStoreButton.click();
        await nameInput.fill(bridgeKvStore.name);
        await typeSelectButton.click();
        await bridgeTypeSelectItem.click();
        await urlInput.fill(bridgeKvStore.url);
        await authTokenInput.fill(bridgeKvStore.authToken);
        await submitButton.click();

        await expect(page.locator('#kv-stores-grid > div', {
            has: page.locator("svg.lucide-server"),
            hasText: bridgeKvStore.name
        })).toBeVisible();
        await expect(page.locator('#kv-stores-grid > div', {
            has: page.locator("svg.lucide-server"),
            hasText: bridgeKvStore.url
        })).toBeVisible();
    });

    test('Create a local Kv Store with custom filename', async ({ page }) => {
        const addKvStoreButton = page.locator('button', { hasText: "Add Kv Store" })
        const nameInput = page.locator("input#name");
        const typeSelectButton = page.locator('button', { hasText: "Select Type" })
        const localTypeSelectItem = page.locator('div[data-slot="select-item"]', { hasText: "local" })
        const localKvDirectoryInput = page.locator("input#localKvDirectory");
        const localKvFileNameInput = page.locator("input#localKvFileName");
        const submitButton = page.locator('button[type=submit]');

        await addKvStoreButton.click();
        await nameInput.fill("Custom Filename Store");
        await typeSelectButton.click();
        await localTypeSelectItem.click();
        await localKvDirectoryInput.fill(testingKvStore.path);
        await localKvFileNameInput.fill(customFileName);
        await submitButton.click();

        const hardDriveIcon = page.locator("svg.lucide-hard-drive")

        await expect(page.locator('#kv-stores-grid > div', {
            has: hardDriveIcon,
            hasText: "Custom Filename Store"
        })).toBeVisible();

        await expect(page.locator('#kv-stores-grid > div', {
            has: hardDriveIcon,
            hasText: customFileName
        })).toBeVisible();
    });

    test('Create a local Kv Store with trailing slash in directory', async ({ page }) => {
        const addKvStoreButton = page.locator('button', { hasText: "Add Kv Store" })
        const nameInput = page.locator("input#name");
        const typeSelectButton = page.locator('button', { hasText: "Select Type" })
        const localTypeSelectItem = page.locator('div[data-slot="select-item"]', { hasText: "local" })
        const localKvDirectoryInput = page.locator("input#localKvDirectory");
        const submitButton = page.locator('button[type=submit]');

        await addKvStoreButton.click();
        await nameInput.fill("Trailing Slash Store");
        await typeSelectButton.click();
        await localTypeSelectItem.click();
        await localKvDirectoryInput.fill(testingKvStore.path + "/");
        await submitButton.click();

        const trailingSlashStoreCard = page.locator('#kv-stores-grid > div', {
            has: page.locator("svg.lucide-hard-drive"),
            hasText: "Trailing Slash Store"
        })
        await expect(trailingSlashStoreCard).toBeVisible();
    });

    test('Create a local Kv Store with "replace existing" option', async ({ page }) => {
        const hardDriveIcon = page.locator("svg.lucide-hard-drive")
        await page.locator('#kv-stores-grid > div', {
            has: hardDriveIcon,
            hasText: customFileName
        }).dblclick({ position: { x: 10, y: 10 } });

        const testEntryKey = "should-be-deleted-after-replacing-the-kv-store"
        await page.evaluate(async (key) => {
            const kvClient = globalThis[btoa('kvClient') as keyof typeof globalThis]
            await kvClient.set([key], {
                type: "String",
                data: "Should be deleted after replacing the current kv store with a new fresh one",
            })
        }, testEntryKey);
        const backButton = page.locator('button svg.lucide-arrow-left-from-line')
        await backButton.click()

        const addKvStoreButton = page.locator('button', { hasText: "Add Kv Store" })
        const nameInput = page.locator("input#name");
        const typeSelectButton = page.locator('button', { hasText: "Select Type" })
        const localTypeSelectItem = page.locator('div[data-slot="select-item"]', { hasText: "local" })
        const localKvDirectoryInput = page.locator("input#localKvDirectory");
        const localKvFileNameInput = page.locator("input#localKvFileName");
        const replaceExistingCheckbox = page.locator('#replaceExisting');
        const submitButton = page.locator('button[type=submit]');

        await addKvStoreButton.click();
        await nameInput.fill("Replace Existing Store");
        await typeSelectButton.click();
        await localTypeSelectItem.click();
        await localKvDirectoryInput.fill(testingKvStore.path);
        await localKvFileNameInput.fill(customFileName);
        await replaceExistingCheckbox.check();
        await submitButton.click();

        const replaceStoreCard = page.locator('#kv-stores-grid > div', {
            has: hardDriveIcon,
            hasText: "Replace Existing Store"
        })
        await expect(replaceStoreCard).toBeVisible();
        await expect(replaceStoreCard).toHaveText(new RegExp(customFileName, "i"));

        await replaceStoreCard.dblclick({ position: { x: 10, y: 10 } });

        const deletedEntryResponse = await page.evaluate(async (key) => {
            const kvClient = globalThis[btoa('kvClient') as keyof typeof globalThis]
            return await kvClient.get([key])
        }, testEntryKey);
        expect(deletedEntryResponse).toEqual({ result: null, error: 'Entry not found' });

        await backButton.click()
    });
}

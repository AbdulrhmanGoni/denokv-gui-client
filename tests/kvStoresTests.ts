import path from "node:path";
import { test, testingKvStore } from "./e2e.spec";
import { expect } from '@playwright/test';
import { mkdirSync, rmSync } from "node:fs";

export function kvStoresTests() {
    const anotherNewKvStore = {
        name: "Another Testing Kv Store",
        path: path.join(import.meta.dirname, "another-kv"),
    }

    test.beforeAll(() => {
        mkdirSync(anotherNewKvStore.path)
    });

    test.afterAll(() => {
        rmSync(anotherNewKvStore.path, { recursive: true, force: true })
    });

    test('Create new Kv Stores', async ({ page }) => {
        const addKvStoreButton = page.locator('button', { hasText: "Add Kv Store" })
        const nameInput = page.locator("input#name");
        const typeSelectButton = page.locator('button', { hasText: "Select Type" })
        const localTypeSelectItem = page.locator('div[data-slot="select-item"]', { hasText: "local" })
        const urlInput = page.locator("input#url");
        const submitButton = page.locator('button[type=submit]');

        // Create the first new kv store
        await addKvStoreButton.click();
        await nameInput.fill(testingKvStore.name);
        await typeSelectButton.click();
        await localTypeSelectItem.click();
        await urlInput.fill(testingKvStore.path);
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
        await urlInput.fill(anotherNewKvStore.path);
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
}

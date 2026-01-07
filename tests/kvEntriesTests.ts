import { expect } from "playwright/test";
import { test, testingKvStore } from "./e2e.spec";

export function kvEntriesTests() {
    test("Add a Kv Entry", async ({ page }) => {
        await page.locator('#kv-stores-grid > div', {
            has: page.locator("svg.lucide-hard-drive"),
            hasText: testingKvStore.name
        }).dblclick({ position: { x: 10, y: 10 } })

        await page.locator('button', { hasText: "Add Entry" }).click()

        await page.locator("#key-editor").fill('["testing-kv-entry"]');

        await page.locator('div[data-slot="dialog-content"] button', { hasText: "Add" }).click();

        await page.keyboard.press("Escape")

        await page.locator('button', { hasText: "Reload" }).click()

        await expect(page.locator('td', { hasText: "testing-kv-entry" })).toBeVisible();
        await expect(page.locator('td', { hasText: "undefined" })).toBeVisible();
    })

    test("Update a Kv Entry", async ({ page }) => {
        await page.locator('td', { hasText: "testing-kv-entry" }).dblclick()

        await page.locator(
            'div[data-slot="dialog-content"] button',
            { has: page.locator("svg.lucide-pencil-line") }
        ).click()

        await page.locator('button[data-slot="select-trigger"]', { hasText: "Undefined" }).click()
        await page.locator('div[data-slot="select-item"]', { hasText: "String" }).click()
        await page.locator('input[data-slot="input"]').fill("new-test-value")
        await page.locator('button', { hasText: "Save", has: page.locator("svg.lucide-save") }).click()
        await page.keyboard.press("Escape")
        await page.locator('button', { hasText: "Reload" }).click()
        await expect(page.locator('td', { hasText: '"new-test-value"' })).toBeVisible();
    })

    test("Delete a Kv Entry", async ({ page }) => {
        await page.locator(
            'td button[data-slot="dropdown-menu-trigger"]',
            { has: page.locator("svg.lucide-ellipsis") }
        ).click()

        await page.locator(
            'div[data-slot="dropdown-menu-item"] button[data-slot="alert-dialog-trigger"]',
            { hasText: "Delete" }
        ).click()

        await page.locator(
            'div[data-slot="alert-dialog-content"] button[data-slot="alert-dialog-action"]',
            { hasText: "Confirm" }
        ).click()

        await expect(page.locator('td', { hasText: "testing-kv-entry" })).not.toBeVisible();
        await expect(page.locator("tbody", { hasText: "No More Entries" })).toBeVisible();
    })
}
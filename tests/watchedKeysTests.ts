import { expect } from "playwright/test";
import { test, testingKvStore } from "./e2e.spec";

const watchedEntries = [
    {
        key: ["watch-tests", "alpha"],
        value: { type: "String", data: "initial-alpha" },
    },
    {
        key: ["watch-tests", "beta"],
        value: { type: "String", data: "initial-beta" },
    },
    {
        key: ["watch-tests", "live"],
        value: { type: "String", data: "initial-live" },
    },
];

async function filterWatchTestEntries(page: import("playwright/test").Page) {
    await page.locator("button", { has: page.locator("svg.lucide-pencil-line") }).click();

    const prefixKeyEditor = page.locator("#prefix-key-editor");
    await prefixKeyEditor.fill('["watch-tests"]');
    await prefixKeyEditor.press("Space");
    await page.waitForTimeout(70);

    const limitInputGroup = page.locator("div[data-slot='input-group']", { hasText: "Limit" });
    await limitInputGroup.locator("input").fill("40");

    await page.locator("button", { hasText: "Apply" }).click();
    await expect(page.locator("tr", { hasText: '"watch-tests"' })).toHaveCount(watchedEntries.length);
}

async function selectEntryRow(page: import("playwright/test").Page, keyPart: string) {
    const row = page.locator("tr", { hasText: `"${keyPart}"` });
    await row.locator('[data-slot="checkbox"]').click();
}

export function watchedKeysTests() {
    test.beforeAll(async ({ page }) => {
        await page.evaluate(async (entries) => {
            const kvClient = globalThis['kvClient' as keyof typeof globalThis];
            for (const entry of entries) {
                await kvClient.set(entry.key, entry.value);
            }
        }, watchedEntries);
    });

    test("Watch and unwatch selected Kv entries", async ({ page }) => {
        await filterWatchTestEntries(page);

        await selectEntryRow(page, "alpha");
        await selectEntryRow(page, "beta");

        await expect(page.locator("button", { hasText: "Watched Keys (0)" })).toBeVisible();
        await page.getByRole("button", { name: "Watch", exact: true }).click();
        await expect(page.locator("button", { hasText: "Watched Keys (2)" })).toBeVisible();

        await page.locator("button", { hasText: "Watched Keys (2)" }).click();
        const dialog = page.locator("div[data-slot='dialog-content'][data-state='open']");

        await expect(dialog).toContainText('"alpha"');
        await expect(dialog).toContainText('"beta"');
        await expect(dialog).toContainText('"initial-alpha"');
        await expect(dialog).toContainText('"initial-beta"');

        await dialog.locator("div.rounded-md.border", { hasText: '"alpha"' }).getByRole("button", { name: "Unwatch", exact: true }).click();
        await expect(page.locator("button", { hasText: "Watched Keys (1)" })).toBeVisible();
        await expect(dialog).not.toContainText('"alpha"');

        await dialog.locator('[data-slot="checkbox"]').click();
        await dialog.locator("button", { hasText: "Unwatch (1)" }).click();

        await expect(page.locator("button", { hasText: "Watched Keys (0)" })).toBeVisible();
        await expect(dialog.locator("p", { hasText: "No Watched Keys" })).toBeVisible();
        await page.keyboard.press("Escape");
    });

    test("Persist watched keys and reflect live updates", async ({ page }) => {
        await filterWatchTestEntries(page);

        await expect(page.locator("button", { hasText: "Watched Keys (0)" })).toBeVisible();
        const liveRow = page.locator("tr", { hasText: '"live"' });
        await liveRow.locator('button[data-slot="dropdown-menu-trigger"]').click();
        await page.locator('div[data-slot="dropdown-menu-item"]', { hasText: "Watch" }).click();
        await expect(page.locator("button", { hasText: "Watched Keys (1)" })).toBeVisible();

        await page.locator("button svg.lucide-arrow-left-from-line").click();
        await page.locator("#kv-stores-grid > div", {
            has: page.locator("svg.lucide-hard-drive"),
            hasText: `${testingKvStore.name} (Renamed)`,
        }).dblclick({ position: { x: 10, y: 10 } });

        await expect(page.locator("button", { hasText: "Watched Keys (1)" })).toBeVisible();
        await page.locator("button", { hasText: "Watched Keys (1)" }).click();
        const dialog = page.locator("div[data-slot='dialog-content'][data-state='open']");
        await expect(dialog).toContainText('"live"');
        await expect(dialog).toContainText('"initial-live"');

        await page.evaluate(async () => {
            const kvClient = globalThis['kvClient' as keyof typeof globalThis];
            await kvClient.set(["watch-tests", "live"], { type: "String", data: "updated-live" });
        });

        await expect(dialog).toContainText('"updated-live"');
        await expect(page.locator("tr", { hasText: '"updated-live"' })).toBeVisible();

        await page.evaluate(async () => {
            const kvClient = globalThis['kvClient' as keyof typeof globalThis];
            await kvClient.deleteKey(["watch-tests", "live"]);
        });

        await expect(dialog.getByText("null").first()).toBeVisible();

        await dialog.getByRole("button", { name: "Unwatch", exact: true }).click();
        await expect(page.locator("button", { hasText: "Watched Keys (0)" })).toBeVisible();
        await page.keyboard.press("Escape");
    });
}

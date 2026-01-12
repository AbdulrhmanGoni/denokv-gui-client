import { expect } from "playwright/test";
import { test } from "./e2e.spec";
import { randomTestingKvEntries, usersTestingKvEntries } from "./testingKvEntries";

export function filteringKvEntriesTests() {
    test.beforeAll(async ({ page }) => {
        await page.evaluate(async (entries) => {
            const kvClient = globalThis[btoa('kvClient') as keyof typeof globalThis]
            for (const entry of entries) {
                await kvClient.set(entry.key, entry.value)
            }
        }, [...randomTestingKvEntries, ...usersTestingKvEntries]);
    })

    test("Check all entries are fetched", async ({ page }) => {
        await page.locator("button", { hasText: "Reload" }).click()
        await expect(page.locator("tr")).toHaveCount(randomTestingKvEntries.length + usersTestingKvEntries.length + 1)
    })

    test("Apply 'prefix' filter and check only entries with prefix are fetched", async ({ page }) => {
        await page.locator("button", { has: page.locator("svg.lucide-pencil-line") }).click()
        const prefixKeyEditor = page.locator("#prefix-key-editor")
        // Focus on the editor and enter a space just to trigger `CodeJar` to set the value to the state variable
        await prefixKeyEditor.fill('["users"]')
        await prefixKeyEditor.press('Space')
        await page.waitForTimeout(70)

        // save for subsequent tests
        await page.locator("label", { hasText: "Save this filter" }).click()

        await page.locator("button", { hasText: "Apply" }).click()

        const usersRows = page.locator("tr", { hasText: '"users"' })
        await expect(usersRows).toHaveCount(usersTestingKvEntries.length)
        for (let i = 1; i <= usersTestingKvEntries.length; i++) {
            await expect(page.locator("tr", { hasText: `[  "users" ,${i}  ]` })).toHaveCount(1)
        }
    })

    test("Apply 'start' & 'end' range filter and check only entries in range are fetched", async ({ page }) => {
        await page.locator("button", { has: page.locator("svg.lucide-pencil-line") }).click()

        await page.locator("button", { hasText: "Reset", has: page.locator("svg.lucide-funnel-x") }).click()

        const startKeyEditor = page.locator("#start-key-editor")
        await startKeyEditor.fill('["users", 5]')
        await startKeyEditor.press('Space')
        await page.waitForTimeout(100)

        const endKeyEditor = page.locator("#end-key-editor")
        await endKeyEditor.fill('["users", 10]')
        await endKeyEditor.press('Space')
        await page.waitForTimeout(100)

        await page.locator("button", { hasText: "Apply" }).click()
        await expect(page.locator("tr", { hasText: '"users"' })).toHaveCount(5)
    })

    test("Apply a random filter and check that no entries are fetched", async ({ page }) => {
        await page.locator("button", { has: page.locator("svg.lucide-pencil-line") }).click()

        await page.locator("button", { hasText: "Reset", has: page.locator("svg.lucide-funnel-x") }).click()

        const prefixKeyEditor = page.locator("#prefix-key-editor")
        await prefixKeyEditor.fill(`["random", "${crypto.randomUUID()}"]`)
        await prefixKeyEditor.press('Space')
        await page.waitForTimeout(70)

        await page.locator("button", { hasText: "Apply" }).click()
        await expect(page.locator("tr", { hasText: 'No Entries in this Deno Kv Store.' })).toHaveCount(1)
    })

    test("Check the saved filter, apply it and check that it is applied", async ({ page }) => {
        await page.locator("button", { has: page.locator("svg.lucide-pencil-line") }).click()
        await page.locator("button", { hasText: "Saved Filters List" }).click()

        await expect(page.locator("h1", { hasText: "Saved Filters" })).toHaveCount(1)

        const dialog = "div[data-slot='dialog-content'][data-state='open']"
        await expect(page.locator(dialog, { hasText: 'Prefix: ["users"]' })).toHaveCount(1)
        await expect(page.locator(dialog, { hasText: 'Start: []' })).toHaveCount(1)
        await expect(page.locator(dialog, { hasText: 'End: []' })).toHaveCount(1)
        await expect(page.locator(dialog, { hasText: 'Limit: 40' })).toHaveCount(1)
        await expect(page.locator(dialog, { hasText: 'Batch Size: 40' })).toHaveCount(1)
        await expect(page.locator(dialog, { hasText: 'Consistency: "strong"' })).toHaveCount(1)
        await expect(page.locator(dialog, { hasText: 'Reverse?: false' })).toHaveCount(1)

        await page.locator("button", { hasText: "Apply" }).click()

        const usersRows = page.locator("tr", { hasText: '"users"' })
        await expect(usersRows).toHaveCount(usersTestingKvEntries.length)
        for (let i = 1; i <= usersTestingKvEntries.length; i++) {
            await expect(page.locator("tr", { hasText: `[  "users" ,${i}  ]` })).toHaveCount(1)
        }
    })

    test("Update the saved filter to return entries in reverse order, re-apply it and check that it is applied", async ({ page }) => {
        await page.locator("button", { has: page.locator("svg.lucide-pencil-line") }).click()
        await page.locator("button", { hasText: "Saved Filters List" }).click()

        await expect(page.locator("h1", { hasText: "Saved Filters" })).toHaveCount(1)

        const dialog = "div[data-slot='dialog-content'][data-state='open']"
        await page.locator(
            `${dialog} button[data-slot="tooltip-trigger"]`,
            { has: page.locator("svg.lucide-square-pen") }
        ).click()

        await page.locator("button[data-slot='checkbox']#reverse-option").click()

        await page.locator("button", { hasText: "Save", has: page.locator("svg.lucide-save") }).click()

        await expect(page.locator(dialog, { hasText: 'Prefix: ["users"]' })).toHaveCount(1)
        await expect(page.locator(dialog, { hasText: 'Start: []' })).toHaveCount(1)
        await expect(page.locator(dialog, { hasText: 'End: []' })).toHaveCount(1)
        await expect(page.locator(dialog, { hasText: `Limit: 40` })).toHaveCount(1)
        await expect(page.locator(dialog, { hasText: 'Batch Size: 40' })).toHaveCount(1)
        await expect(page.locator(dialog, { hasText: 'Consistency: "strong"' })).toHaveCount(1)
        await expect(page.locator(dialog, { hasText: 'Reverse?: true' })).toHaveCount(1) // what changed

        await page.locator("button", { hasText: "Apply" }).click()

        const usersRows = page.locator("tr", { hasText: '"users"' })
        await expect(usersRows).toHaveCount(usersTestingKvEntries.length)
        for (let i = usersTestingKvEntries.length; i >= 1; i--) {
            await expect(usersRows.nth(i - usersTestingKvEntries.length)).toHaveText(new RegExp(`[  "users" ,${i}  ]`))
        }
    })

    test("Delete the saved filter", async ({ page }) => {
        await page.locator("button", { has: page.locator("svg.lucide-pencil-line") }).click()
        await page.locator("button", { hasText: "Saved Filters List" }).click()

        await expect(page.locator("h1", { hasText: "Saved Filters" })).toHaveCount(1)

        const dialog = "div[data-slot='dialog-content'][data-state='open']"
        await page.locator(
            `${dialog} button[data-slot="alert-dialog-trigger"]`,
            { has: page.locator("svg.lucide-trash") }
        ).click()

        await page.locator(`button[data-slot="alert-dialog-action"]`, { hasText: "Delete" }).click()

        await expect(page.locator(`${dialog} p`).last()).toHaveText("No Saved filters for this KV store")

        await page.locator(`button`, { hasText: "Back", has: page.locator("svg.lucide-arrow-left") }).click()
    })

    test("Apply a small page-size via 'limit' option and navigate through multiple pages of entries", async ({ page }) => {
        await page.locator("button", { hasText: "Reset", has: page.locator("svg.lucide-funnel-x") }).click()

        const newLimit = 3
        const limitInputGroup = page.locator("div[data-slot='input-group']", { hasText: "Limit" })
        await limitInputGroup.locator("input").fill(newLimit.toString())
        await page.locator("button", { hasText: "Apply" }).click()

        const rows = page.locator("tr")
        const expectedMaxRowsCount = newLimit + 1

        const nextButton = page.locator("button", { hasText: "Next", has: page.locator("svg.lucide-arrow-right") })
        const entriesLength = Math.ceil((randomTestingKvEntries.length + usersTestingKvEntries.length) / newLimit)
        for (let i = 0; i < entriesLength; i++) {
            expect(await rows.count() <= expectedMaxRowsCount).toBeTruthy()
            const isLastPage = await nextButton.isDisabled()
            if (isLastPage) {
                break
            }
            await nextButton.click()
        }

        const prevButton = page.locator("button", { hasText: "Prev", has: page.locator("svg.lucide-arrow-left") })
        for (let i = 0; i < entriesLength; i++) {
            await prevButton.click()
            expect(await rows.count() <= expectedMaxRowsCount).toBeTruthy()

            const isFirstPage = await prevButton.isDisabled()
            if (isFirstPage) {
                break
            }
        }
    })
}
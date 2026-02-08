import { expect } from "playwright/test";
import { test } from "./e2e.spec";

export function atomicOperationsTests() {
    test("Check that a Kv Entry doesn't exist before adding it", async ({ page }) => {
        await page.locator('button', { hasText: "Atomic" }).click()
        await page.locator('button', { hasText: "check" }).click()
        await page.locator("#check-key-editor").fill('["new-kv-that-did-not-exist"]');
        await page.locator('button', { hasText: "Add Check" }).click();

        await page.locator('button', { hasText: "set", hasNotText: "Reset" }).click();
        await page.locator('button', { has: page.locator("svg.lucide-chevron-down"), hasText: "Undefined" }).click();
        await page.locator('div[data-slot="select-item"]', { hasText: "Boolean" }).click();
        const setKeyEditor = page.locator('div#key-editor');
        await setKeyEditor.fill('["new-kv-that-did-not-exist"]');
        await setKeyEditor.press('Space');
        await page.locator('button', { hasText: "true" }).click();
        await page.locator('button', { hasText: "Add Set Operation" }).click();

        await page.locator('button', { hasText: "Commit" }).click()

        const response = await page.evaluate(async () => {
            const kvClient = globalThis[btoa('kvClient') as keyof typeof globalThis]
            return await kvClient.get(["new-kv-that-did-not-exist"])
        });

        expect(response).toEqual({
            result: {
                key: ["new-kv-that-did-not-exist"],
                value: {
                    type: "Boolean",
                    data: true,
                },
                versionstamp: expect.any(String),
            },
            error: null,
        });
    })

    test("Check that a Kv Entry already exists to avoid re-setting it again", async ({ page }) => {
        await page.locator('button', { hasText: "check" }).click()
        await page.locator("#check-key-editor").fill('["new-kv-that-did-not-exist"]');
        await page.locator('button', { hasText: "Add Check" }).click();

        await page.locator('button', { hasText: "set", hasNotText: "Reset" }).click();
        await page.locator('button', { has: page.locator("svg.lucide-chevron-down"), hasText: "Undefined" }).click();
        await page.locator('div[data-slot="select-item"]', { hasText: "Boolean" }).click();
        const setKeyEditor = page.locator('div#key-editor');
        await setKeyEditor.fill('["new-kv-that-did-not-exist"]');
        await setKeyEditor.press('Space');
        await page.locator('button', { hasText: "false" }).click(); // supposed to fail to set to false
        await page.locator('button', { hasText: "Add Set Operation" }).click();

        await page.locator('button', { hasText: "Commit" }).click()

        const response = await page.evaluate(async () => {
            const kvClient = globalThis[btoa('kvClient') as keyof typeof globalThis]
            return await kvClient.get(["new-kv-that-did-not-exist"])
        });

        expect(response).toEqual({
            result: {
                key: ["new-kv-that-did-not-exist"],
                value: {
                    type: "Boolean",
                    data: true, // didn't change
                },
                versionstamp: expect.any(String),
            },
            error: null,
        });
    })

    test("Add, Delete, and Update entries in one atomic transaction", async ({ page }) => {
        await page.evaluate(async () => {
            const kvClient = globalThis[btoa('kvClient') as keyof typeof globalThis]
            await kvClient.set(["new-kv", "should-be-updated-in-atomic-transaction", true], {
                type: "String",
                data: "should-be-updated",
            })
        });

        await page.locator('button', { hasText: "Reset" }).click()

        // Add a new entry
        await page.locator('button', { hasText: "set", hasNotText: "Reset" }).click();
        const setKeyEditor = page.locator('div#key-editor');
        await setKeyEditor.fill('["new-kv", "added-in-atomic-transaction"]');
        await setKeyEditor.press('Space');
        await page.locator('button', { has: page.locator("svg.lucide-chevron-down"), hasText: "Undefined" }).click();
        await page.locator('div[data-slot="select-item"]', { hasText: "Number" }).click();
        await page.locator('div[data-slot="input-group"] input[type="number"]').fill("123");
        await page.locator('div[data-slot="input-group-addon"] button').click();
        await page.locator('button', { hasText: "Add Set Operation" }).click();

        // Delete an existing entry
        await page.locator('button', { hasText: "delete" }).click();
        const deleteKeyEditor = page.locator('div#delete-key-editor');
        await deleteKeyEditor.fill('["new-kv-that-did-not-exist"]');
        await deleteKeyEditor.press('Space');
        await page.locator('button', { hasText: "Add Delete Operation" }).click();

        // Update an existing entry
        await page.locator('button', { hasText: "set", hasNotText: "Reset" }).click();
        const updateKeyEditor = page.locator('div#key-editor');
        await updateKeyEditor.fill('["new-kv", "should-be-updated-in-atomic-transaction", true]');
        await updateKeyEditor.press('Space');
        await page.locator('button', { has: page.locator("svg.lucide-chevron-down"), hasText: "Undefined" }).click();
        await page.locator('div[data-slot="select-item"]', { hasText: "String" }).click();
        await page.locator('input[type="text"]').fill("was-updated");
        await page.locator('button', { hasText: "Add Set Operation" }).click();

        // Commit the transaction
        await page.locator('button', { hasText: "Commit" }).click()

        const responses = await page.evaluate(async () => {
            const kvClient = globalThis[btoa('kvClient') as keyof typeof globalThis]
            return {
                newKvResponse: await kvClient.get(["new-kv", "added-in-atomic-transaction"]),
                deletedKvResponse: await kvClient.get(["new-kv-that-did-not-exist"]),
                updatedKvResponse: await kvClient.get(["new-kv", "should-be-updated-in-atomic-transaction", true]),
            }
        });

        expect(responses.newKvResponse).toEqual({
            result: {
                key: ["new-kv", "added-in-atomic-transaction"],
                value: {
                    type: "Number",
                    data: 123,
                },
                versionstamp: expect.any(String),
            },
            error: null,
        });
        expect(responses.deletedKvResponse).toEqual({
            error: "Entry not found",
            result: null,
        });
        expect(responses.updatedKvResponse).toEqual({
            result: {
                key: ["new-kv", "should-be-updated-in-atomic-transaction", true],
                value: {
                    type: "String",
                    data: "was-updated",
                },
                versionstamp: expect.any(String),
            },
            error: null,
        });
    })

    test("All operations fail due to one failed operation in the transaction", async ({ page }) => {
        await page.evaluate(async () => {
            const kvClient = globalThis[btoa('kvClient') as keyof typeof globalThis]
            await kvClient.set(["new-kv", "should-not-be-updated-in-atomic-transaction", true], {
                type: "String",
                data: "should-not-be-updated",
            })
        });

        // Add a new entry
        await page.locator('button', { hasText: "set", hasNotText: "Reset" }).click();
        const setKeyEditor = page.locator('div#key-editor');
        await setKeyEditor.fill('["new-kv", "should-not-be-added"]');
        await setKeyEditor.press('Space');
        await page.locator('button', { hasText: "Add Set Operation" }).click();

        // Delete an existing entry
        await page.locator('button', { hasText: "delete" }).click();
        const deleteKeyEditor = page.locator('div#delete-key-editor');
        await deleteKeyEditor.fill('["new-kv", "added-in-atomic-transaction"]');
        await deleteKeyEditor.press('Space');
        await page.locator('button', { hasText: "Add Delete Operation" }).click();

        // Update an existing entry
        await page.locator('button', { hasText: "set", hasNotText: "Reset" }).click();
        const updateKeyEditor = page.locator('div#key-editor');
        await updateKeyEditor.fill('["new-kv", "should-not-be-updated-in-atomic-transaction", true]');
        await updateKeyEditor.press('Space');
        await page.locator('button', { has: page.locator("svg.lucide-chevron-down"), hasText: "Undefined" }).click();
        await page.locator('div[data-slot="select-item"]', { hasText: "String" }).click();
        await page.locator('input[type="text"]').fill("update-that-wont-take-effect");
        await page.locator('button', { hasText: "Add Set Operation" }).click();

        // Invalid Key to cause the transaction to fail
        await page.locator('button', { hasText: "delete" }).click();
        await deleteKeyEditor.fill('["new-kv", ["invalid-key"]]');
        await deleteKeyEditor.press('Space');
        await page.locator('button', { hasText: "Add Delete Operation" }).click();

        // Commit the transaction
        await page.locator('button', { hasText: "Commit" }).click()

        const responses = await page.evaluate(async () => {
            const kvClient = globalThis[btoa('kvClient') as keyof typeof globalThis]
            return {
                newKvResponse: await kvClient.get(["new-kv", "should-not-be-added"]),
                deletedKvResponse: await kvClient.get(["new-kv", "added-in-atomic-transaction"]),
                updatedKvResponse: await kvClient.get(["new-kv", "should-not-be-updated-in-atomic-transaction", true]),
            }
        });

        // wasn't added
        expect(responses.newKvResponse).toEqual({
            error: "Entry not found",
            result: null,
        });
        // wasn't deleted
        expect(responses.deletedKvResponse).not.toEqual({
            error: "Entry not found",
            result: null,
        });
        expect(responses.updatedKvResponse).toEqual({
            result: {
                key: ["new-kv", "should-not-be-updated-in-atomic-transaction", true],
                value: {
                    type: "String",
                    data: "should-not-be-updated", // didn't change
                },
                versionstamp: expect.any(String),
            },
            error: null,
        });
    })

    test("Use 'sum', 'min', and 'max' operations in one atomic transaction", async ({ page }) => {
        await page.locator('button', { hasText: "Reset" }).click()

        type TestOperation = {
            name: "sum" | "min" | "max";
            currentValue: number;
            operationValue: number;
            result: number
        }

        const operations: TestOperation[] = [
            { name: "sum", currentValue: 10, operationValue: 10, result: 20 },
            { name: "min", currentValue: 5, operationValue: 1, result: 1 },
            { name: "max", currentValue: 1000, operationValue: 100, result: 1000 },
        ]

        await page.evaluate(async (operations: TestOperation[]) => {
            const kvClient = globalThis[btoa('kvClient') as keyof typeof globalThis]
            for (const operation of operations) {
                await kvClient.set(["operations", operation.name], {
                    type: "KvU64",
                    data: operation.currentValue,
                })
            }
        }, operations);

        for (const operation of operations) {
            await page.locator('button', { hasText: operation.name }).click();
            const setKeyEditor = page.locator(`div#${operation.name}-key-editor`);
            await setKeyEditor.fill(`["operations", "${operation.name}"]`);
            await setKeyEditor.press('Space');
            await page.locator(`input#${operation.name}-value-input`).fill(operation.operationValue.toString());
            await page.locator('button', { hasText: `Add ${operation.name}` }).click();
        }

        // Commit the transaction
        await page.locator('button', { hasText: "Commit" }).click()

        const responses: { operation: TestOperation; response: any }[] =
            await page.evaluate(async (operations: TestOperation[]) => {
                const kvClient = globalThis[btoa('kvClient') as keyof typeof globalThis]
                const responses: { operation: TestOperation; response: any }[] = []
                for (const operation of operations) {
                    responses.push({
                        operation,
                        response: await kvClient.get(["operations", operation.name])
                    })
                }
                return responses
            }, operations);

        for (const { operation, response } of responses) {
            expect(response).toEqual({
                result: {
                    key: ["operations", operation.name],
                    value: {
                        type: "KvU64",
                        data: operation.result.toString(),
                    },
                    versionstamp: expect.any(String),
                },
                error: null,
            })
        }
    })
}
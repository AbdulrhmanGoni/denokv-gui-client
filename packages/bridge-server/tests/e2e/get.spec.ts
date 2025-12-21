import { describe, it, expect } from "vitest";
import type { TestDependencies } from "./index.test.ts";
import { fakeData } from "../fakeTestData.ts";
import { serializeKvKey } from "../../src/serialization/main.ts";

export function getEndpointSpec({ bridgeServerClient, kv }: TestDependencies) {
    describe("'GET /get/:key' endpoint's specifications", () => {
        it("should retrieve an existing kv entry successfully", async () => {
            const existingKey = serializeKvKey(fakeData[0].key);
            const getRes = await bridgeServerClient.get(existingKey);
            expect(getRes.result).toMatchObject({
                key: existingKey,
                value: expect.anything(),
                versionstamp: expect.any(String),
            });
        });

        it("should retrieve null for unexisting kv entry", async () => {
            const arbitraryKey = [34, true, false]
            const getRes = await bridgeServerClient.get(arbitraryKey);
            expect(getRes.result).toBe(null);
            expect(getRes.error).toMatch(/not found/g);
        });

        it("should not fail because of the slashes in a key part", async () => {
            const keyWithSlashes = ["/with/slashes"]
            const data = "slash!"
            await kv.set(keyWithSlashes, data)
            const getRes = await bridgeServerClient.get(keyWithSlashes);
            expect(getRes.result?.value.type).toBe("String");
            expect(getRes.result?.value.data).toBe(data);
        });
    });
}

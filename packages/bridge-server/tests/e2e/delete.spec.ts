import { describe, it, expect } from "vitest";
import type { TestDependencies } from "./index.test.ts";
import { serializeKvKey } from "../../src/serialization/main.ts";
import { fakeData } from "../fakeTestData.ts";

export function deleteEndpointSpec({ kv, bridgeServerClient }: TestDependencies) {
    describe("'DELETE /delete' endpoint's specifications", () => {
        it("should delete an existing kv entry successfully", async () => {
            const delRes = await bridgeServerClient.delete(serializeKvKey(fakeData[1].key));
            expect(delRes.result).toEqual(true);

            const entry = await kv.get(fakeData[1].key)
            expect(entry.value).toEqual(null);
            expect(entry.versionstamp).toEqual(null);
        });

        it("should resolve silently when trying to delete a unexisting kv entry", async () => {
            const delRes = await bridgeServerClient.delete(serializeKvKey([6, "any-thing", 0]));
            expect(delRes.result).toEqual(true);
        });
    });
}



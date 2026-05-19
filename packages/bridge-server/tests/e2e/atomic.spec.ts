import { describe, it, expect } from "vitest";
import type { TestDependencies } from "./index.test.ts";

export function atomicEndpointSpec({ bridgeServerClient, kv }: TestDependencies) {
    describe("'POST /atomic' endpoint's specifications", () => {
        it("should perform a simple atomic set and retrieve it", async () => {
            const key = ["e2e", "atomic", "set", Date.now()];
            const serializedKey = JSON.stringify(key);

            const res = await bridgeServerClient.atomic([
                {
                    name: "set",
                    key: serializedKey,
                    value: { type: "String", data: "atomic-value" }
                }
            ]);

            expect(res.result).toBe(true);

            const getRes = await kv.get(key);
            expect(getRes.value).toBe("atomic-value");
        });

        it("should fail atomic operation if check fails", async () => {
            const key = ["e2e", "atomic", "check-fail", Date.now()];
            await kv.set(key, "initial");
            const entry = await kv.get(key);

            // Perform another set to change versionstamp
            await kv.set(key, "changed");

            const res = await bridgeServerClient.atomic([
                {
                    name: "check",
                    key: JSON.stringify(key),
                    versionstamp: entry.versionstamp // This is now old
                },
                {
                    name: "set",
                    key: JSON.stringify(key),
                    value: { type: "String", data: "wont-happen" }
                }
            ]);

            expect(res.result).toBe(false);
            const finalRes = await kv.get(key);
            expect(finalRes.value).toBe("changed");
        });

        it("should perform number operations: sum, min, max", async () => {
            const key = ["e2e", "atomic", "numbers", Date.now()];
            const serializedKey = JSON.stringify(key);

            // Set initial value
            await bridgeServerClient.set(key, { type: "KvU64", data: 10 });

            const res = await bridgeServerClient.atomic([
                { name: "sum", key: serializedKey, value: 5 },
                { name: "max", key: serializedKey, value: 20 },
                { name: "min", key: serializedKey, value: 12 }
            ]);

            expect(res.result).toBe(true);

            const finalRes = await kv.get<{ value: bigint }>(key);
            // 10 + 5 = 15. max(15, 20) = 20. min(20, 12) = 12.
            expect(finalRes.value?.value).toEqual(BigInt(12));
        });

        it("should perform delete operation", async () => {
            const key = ["e2e", "atomic", "delete", Date.now()];
            await kv.set(key, "to-be-deleted");

            const res = await bridgeServerClient.atomic([
                { name: "delete", key: JSON.stringify(key) }
            ]);

            expect(res.result).toBe(true);
            const getRes = await kv.get(key);
            expect(getRes.value).toBe(null);
        });

        it("should perform enqueue operation within atomic", async () => {
            const res = await bridgeServerClient.atomic([
                {
                    name: "enqueue",
                    value: { type: "String", data: "enqueued-via-atomic" }
                }
            ]);

            expect(res.result).toBe(true);
        });

        it("should fail if operations array is empty", async () => {
            const res = await bridgeServerClient.atomic([]);
            expect(res.result).toBe(null);
            expect(res.error).toMatch(/must be an array of at least one/i);
        });

        it("should fail if an operation name is invalid", async () => {
            const res = await bridgeServerClient.atomic([
                // @ts-expect-error testing invalid input
                { name: "invalid-op", key: "['foo']" }
            ]);
            expect(res.result).toBe(null);
            expect(res.error).toMatch(/Unknown or unsupported atomic operation/i);
        });

        it("should fail if 'set' operation is missing a key", async () => {
            const res = await bridgeServerClient.atomic([
                // @ts-expect-error testing invalid input
                { name: "set", value: { type: "String", data: "val" } }
            ]);
            expect(res.result).toBe(null);
            expect(res.error).toMatch(/'set' operation must have a key/i);
        });

        it("should fail if 'sum' operation value is not a number", async () => {
            const res = await bridgeServerClient.atomic([
                // @ts-expect-error testing invalid input
                { name: "sum", key: "['bal']", value: "not-a-number" }
            ]);
            expect(res.result).toBe(null);
            expect(res.error).toMatch(/'sum' operation must have an integer value|not an integer/i);
        });

        it("should fail if key is an invalid Deno KV key structure", async () => {
            const res = await bridgeServerClient.atomic([
                { name: "delete", key: "{ invalid: 'key' }" }
            ]);
            expect(res.result).toBe(null);
            expect(res.error).toMatch(/invalid Deno Kv key/i);
        });
    });
}

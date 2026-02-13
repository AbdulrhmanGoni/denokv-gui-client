import { describe, it, expect } from "vitest";
import type { TestDependencies } from "./index.test.ts";
import type { SerializedKvValue } from "../../src/serialization/main.ts";

export function setEndpointSpec({ bridgeServerClient, kv }: TestDependencies) {
    describe("'PUT /set' endpoint's specifications", () => {
        it("should set a kv entry and then retrieve it successfully", async () => {
            const key = ["e2e", "set", `${Date.now()}-${Math.random()}`];
            const value: SerializedKvValue = {
                type: "Object",
                data: JSON.stringify({ foo: "bar", n: 42 }),
            };

            const putRes = await bridgeServerClient.set(key, value);
            expect(putRes.result).toEqual(true);

            const getRes = await kv.get(key);
            expect(getRes).toMatchObject({
                key: expect.any(Array),
                value: { foo: expect.any(String), n: expect.any(Number) },
                versionstamp: expect.any(String),
            });
        });

        it("should set a kv entry with KvU64 value", async () => {
            const key = ["e2e", "set", `${Date.now()}-${Math.random()}`];
            const value = { type: "KvU64", data: 5 };

            const putRes = await bridgeServerClient.set(key, value);
            expect(putRes.result).toEqual(true);

            const getRes = await kv.get<{ value: bigint }>(key);
            expect(getRes).toMatchObject({
                key: expect.any(Array),
                value: { value: expect.any(BigInt) },
                versionstamp: expect.any(String),
            });

            expect(Object.getPrototypeOf(getRes.value).constructor.name).toMatch(/KvU64/g)
        });

        it("should not overwrite existing entry if overwrite is false", async () => {
            const key = ["e2e", "set", "no-overwrite", `${Date.now()}`];
            await bridgeServerClient.set(key, { type: "String", data: "initial" });

            const res = await bridgeServerClient.set(key, { type: "String", data: "new" }, { overwrite: false });
            expect(res.error).toBe("The Kv Entry is already existing.");
            expect(res.result).toBeNull();
            const getRes = await kv.get(key);
            expect(getRes.value).toBe("initial");
        });
    });
}



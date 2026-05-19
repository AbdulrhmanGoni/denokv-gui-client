import { describe, it, expect } from "vitest";
import type { TestDependencies } from "./index.test.ts";
import type { SerializedKvValue } from "../../src/serialization/main.ts";

export function setEndpointSpec({ bridgeServerClient, kv }: TestDependencies) {
    describe("'PUT /set' endpoint's specifications", () => {
        it("should set a kv entry and then retrieve it successfully", async () => {
            const key = ["e2e", "set", `${Date.now()}-${Math.random()}`];
            const data = { foo: "bar", n: 42 }
            const value: SerializedKvValue = {
                type: "Object",
                data: JSON.stringify(data),
            };

            const putRes = await bridgeServerClient.set(key, value);
            expect(putRes.result).toMatchObject({
                ok: true,
                versionstamp: expect.any(String),
            });

            const getRes = await kv.get(key);
            expect(getRes).toMatchObject({
                key: expect.any(Array),
                value: data,
                versionstamp: putRes.result?.versionstamp,
            });
        });

        it("should set a kv entry with KvU64 value", async () => {
            const key = ["e2e", "set", `${Date.now()}-${Math.random()}`];
            const value = { type: "KvU64", data: 5 };

            const putRes = await bridgeServerClient.set(key, value);
            expect(putRes.result).toMatchObject({
                ok: true,
                versionstamp: expect.any(String),
            });

            const getRes = await kv.get<{ value: bigint }>(key);
            expect(getRes).toMatchObject({
                key: expect.any(Array),
                value: { value: BigInt(value.data) },
                versionstamp: putRes.result?.versionstamp,
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

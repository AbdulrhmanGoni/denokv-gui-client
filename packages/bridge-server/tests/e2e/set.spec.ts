import { describe, it, expect } from "vitest";
import type { TestDependencies } from "./index.test.ts";
import type { SerializedKvValue } from "../../src/serialization/main.ts";

export function setEndpointSpec({ bridgeServerClient, kv }: TestDependencies) {
  describe("'PUT /set' endpoint's specifications", () => {
    it("should set a kv entry and then retrieve it successfully", async () => {
      const key = ["e2e", "set", `${Date.now()}-${Math.random()}`];
      const data = { foo: "bar", n: 42 };
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

      expect(Object.getPrototypeOf(getRes.value).constructor.name).toMatch(/KvU64/g);
    });

    it("should not overwrite existing entry if overwrite is false", async () => {
      const key = ["e2e", "set", "no-overwrite", `${Date.now()}`];
      await bridgeServerClient.set(key, { type: "String", data: "initial" });

      const res = await bridgeServerClient.set(
        key,
        { type: "String", data: "new" },
        { overwrite: false },
      );
      expect(res.error).toBe("The Kv Entry is already existing.");
      expect(res.result).toBeNull();
      const getRes = await kv.get(key);
      expect(getRes.value).toBe("initial");
    });

    it("should set the key when passed as JS literal and 'jsKey' parameter is true", async () => {
      const key = "[new Uint8Array([5, 6, 7]), 'set', 47727732n]";
      const value = { type: "String", data: "jsKeyVal" };
      const res = await bridgeServerClient.set(key as any, value, {
        jsKey: true,
      });
      expect(res.result?.ok).toBe(true);

      const dbVal = await kv.get([new Uint8Array([5, 6, 7]), "set", 47727732n]);
      expect(dbVal.value).toBe("jsKeyVal");
    });

    it("should return an error for the key when passed as JS literal and 'jsKey' parameter is false or missing", async () => {
      const key = "[new Uint8Array([4, 8, 9]), 'set', 999999n]";
      const value = { type: "String", data: "jsKeyVal" };
      const res1 = await bridgeServerClient.set(key as any, value);
      expect(res1.error).toContain("Invalid JSON format for KvKey.");

      const res2 = await bridgeServerClient.set(key as any, value, {
        jsKey: false,
      });
      expect(res2.error).toContain("Invalid JSON format for KvKey.");

      const dbVal = await kv.get([new Uint8Array([4, 8, 9]), "set", 999999n]);
      expect(dbVal.value).toBeNull();
    });
  });
}

import { describe, it, expect } from "vitest";
import type { TestDependencies } from "./index.test.ts";
import { serializeKvKey } from "../../src/serialization/main.ts";
import { fakeData } from "../fakeTestData.ts";

export function deleteEndpointSpec({
  kv,
  bridgeServerClient,
}: TestDependencies) {
  describe("'DELETE /delete' endpoint's specifications", () => {
    it("should delete an existing kv entry successfully", async () => {
      const delRes = await bridgeServerClient.delete(
        serializeKvKey(fakeData[1].key),
      );
      expect(delRes.result).toBe(true);

      const entry = await kv.get(fakeData[1].key);
      expect(entry.value).toBeNull();
      expect(entry.versionstamp).toBeNull();
    });

    it("should resolve silently when trying to delete a unexisting kv entry", async () => {
      const delRes = await bridgeServerClient.delete(
        serializeKvKey([6, "any-thing", 0]),
      );
      expect(delRes.result).toEqual(true);
    });

    it("should succeed to delete the key when passed as a JS literal and jsKey query is true", async () => {
      const targetKeyName = ["e2e", "delete", 1000000n];
      await kv.set(targetKeyName, "to-be-deleted");

      const targetKey = "['e2e', 'delete', 1000000n]";
      const res = await bridgeServerClient.delete(targetKey, {
        jsKey: true,
      });
      expect(res.result).toBe(true);

      const dbVal = await kv.get(targetKeyName);
      expect(dbVal.value).toBeNull();
      expect(dbVal.versionstamp).toBeNull();
    });

    it("should fail to delete the key when passed as a JS literal and jsKey query is false or missing", async () => {
      const targetKeyName = ["e2e", "delete", new Uint8Array([22, 22, 22])];
      await kv.set(targetKeyName, "to-be-deleted");

      const targetKey = "['e2e', 'delete', new Uint8Array([22, 22, 22])]";

      const res1 = await bridgeServerClient.delete(targetKey);
      expect(res1.result).toBeNull();
      expect(res1.error).toContain("Invalid JSON format for KvKey.");

      const res2 = await bridgeServerClient.delete(targetKey, {
        jsKey: false,
      });
      expect(res2.result).toBeNull();
      expect(res2.error).toContain("Invalid JSON format for KvKey.");

      const dbVal = await kv.get(targetKeyName);
      expect(dbVal.value).toBe("to-be-deleted");
      expect(dbVal.versionstamp).toBeTypeOf("string");
    });

    it("should succeed to delete the key when passed as a JS literal with JSON form part", async () => {
      const targetKeyName = [
        "delete",
        1000000n,
        new Uint8Array([111, 111, 111]),
      ];
      await kv.set(targetKeyName, "to-be-deleted");

      const targetKey =
        "['delete', 1000000n, {type: 'Uint8Array', value: 'new Uint8Array([111, 111, 111])'}]";
      const res = await bridgeServerClient.delete(targetKey, {
        jsKey: true,
      });
      expect(res.result).toBe(true);

      const dbVal = await kv.get(targetKeyName);
      expect(dbVal.value).toBeNull();
      expect(dbVal.versionstamp).toBeNull();
    });
  });
}

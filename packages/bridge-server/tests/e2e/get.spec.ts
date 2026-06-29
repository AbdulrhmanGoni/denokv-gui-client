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
      const arbitraryKey = [34, true, false];
      const getRes = await bridgeServerClient.get(arbitraryKey);
      expect(getRes.result).toBe(null);
      expect(getRes.error).toMatch(/not found/g);
    });

    it("should not fail because of the slashes in a key part", async () => {
      const keyWithSlashes = ["/with/slashes"];
      const data = "slash!";
      await kv.set(keyWithSlashes, data);
      const getRes = await bridgeServerClient.get(keyWithSlashes);
      expect(getRes.result?.value.type).toBe("String");
      expect(getRes.result?.value.data).toBe(data);
    });

    it("should respect the xssSafe option when returning an entry", async () => {
      const key = ["xss", "get_test"];
      await bridgeServerClient.set(key, {
        type: "Object",
        data: '{ data: "<script>alert(6)</script>" }',
      });

      const resSafe = await bridgeServerClient.get(key);
      const resUnsafe = await bridgeServerClient.get(key, { xssSafe: false });

      expect(resSafe.result?.value.data).toContain("\\u003Cscript\\u003E");
      expect(resUnsafe.result?.value.data).toContain("<script>");

      await bridgeServerClient.delete(key);
    });

    it("should return an error because the key is a JS literal but the jsKey query parameter is false or missing", async () => {
      const key = "[548648954n, 'test']";
      const res1 = await bridgeServerClient.get(key as any, {
        jsKey: false,
      });
      expect(res1.result).toBeNull();
      expect(res1.error).toContain("Invalid JSON format for KvKey.");

      const res2 = await bridgeServerClient.get(key as any);
      expect(res2.result).toBeNull();
      expect(res2.error).toContain("Invalid JSON format for KvKey.");
    });

    it("should handle the JS literal key and retrieve data when the 'jsKey' query parameter is true", async () => {
      const key = "['users', 'da'+'ve']";
      const res = await bridgeServerClient.get(key as any, {
        jsKey: true,
      });
      expect(res.result).toMatchObject({
        key: ["users", "dave"],
        value: { type: "Object", data: expect.anything() },
      });
    });

    it("should handle the key when passed as JSON and retrieve the kv entry even if 'jsKey' query parameter is true", async () => {
      const existingKey = serializeKvKey(fakeData[1].key);
      const getRes = await bridgeServerClient.get(existingKey, { jsKey: true });
      expect(getRes.result).toMatchObject({
        key: existingKey,
        value: expect.anything(),
        versionstamp: expect.any(String),
      });
    });
  });
}

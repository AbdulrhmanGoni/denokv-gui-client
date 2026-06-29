import { describe, it, expect } from "vitest";
import { fakeData } from "../fakeTestData.ts";
import type { TestDependencies } from "./index.test.ts";

export function browseEndpointSpec({ bridgeServerClient }: TestDependencies) {
  describe("'GET /browse' endpoint's specifications", () => {
    it("should return available all entries", async () => {
      const res = await bridgeServerClient.browse();
      expect(res.result?.entries).toBeInstanceOf(Array);
      expect(res.result?.entries.length).toBe(fakeData.length);
      expect(res.result?.entries[0]).toMatchObject({
        key: expect.any(Array),
        value: expect.anything(),
        versionstamp: expect.any(String),
      });
    });

    it("should return 5 entries because of 'limit=5' option", async () => {
      const options = {
        limit: 5,
      };

      const res = await bridgeServerClient.browse(options);
      expect(res.result?.entries).toBeInstanceOf(Array);
      expect(res.result?.entries.length).toBe(options.limit);
      expect(res.result?.entries[0]).toMatchObject({
        key: expect.any(Array),
        value: expect.anything(),
        versionstamp: expect.any(String),
      });
    });

    it("should return the entries with a specific 'users' prefix", async () => {
      const options = {
        prefix: ["users"],
      };

      const res = await bridgeServerClient.browse(options);
      expect(res.result?.entries).toBeInstanceOf(Array);
      res.result?.entries.forEach((entry) => {
        expect(entry.key[0]).toBe(options.prefix[0]);
      });
    });

    it("should respect the xssSafe option when returning entries", async () => {
      const key = ["xss", "browse_test"];
      await bridgeServerClient.set(key, {
        type: "Object",
        data: '{ data: "<script>alert(1)</script>" }',
      });

      const resSafe = await bridgeServerClient.browse({ prefix: ["xss"] });
      const resUnsafe = await bridgeServerClient.browse({
        prefix: ["xss"],
        xssSafe: false,
      });

      expect(resSafe.result?.entries[0].value.data).toContain(
        "\\u003Cscript\\u003E",
      );
      expect(resUnsafe.result?.entries[0].value.data).toContain("<script>");

      await bridgeServerClient.delete(key);
    });

    it("should return the entries with the prefix key passed as JS string", async () => {
      const options = { prefix: "['users']", jsKey: true };

      const res = await bridgeServerClient.browse(options);
      expect(res.result?.entries).toBeInstanceOf(Array);
      res.result?.entries.forEach((entry) => {
        expect(entry.key[0]).toBe("users");
      });
    });

    it("should return an error if the prefix key passed as JS string and jsKey option is false or missing", async () => {
      const prefix = "['users']";

      const res1 = await bridgeServerClient.browse({ prefix });
      expect(res1.result).toBeNull();
      expect(res1.error).toContain("Invalid JSON format for KvKey.");

      const res2 = await bridgeServerClient.browse({ prefix, jsKey: false });
      expect(res2.result).toBeNull();
      expect(res2.error).toContain("Invalid JSON format for KvKey.");
    });
  });
}

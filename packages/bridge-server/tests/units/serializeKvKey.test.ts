import { describe, it, expect } from "vitest";
import { serializeKvKey } from "../../src/index.ts";

describe("Test serializeKvKey function", () => {
  it("should serialize a key with all expected primitive values", () => {
    const key = ["posts", 123, true];
    const expected = ["posts", 123, true];
    expect(serializeKvKey(key)).toEqual(expected);
  });

  it("should serialize a key with BigInt", () => {
    const key = ["transactions", 12345678901234567890n];
    const expected = ["transactions", { type: "BigInt", value: "12345678901234567890" }];
    expect(serializeKvKey(key)).toEqual(expected);
  });

  it("should serialize a key with Uint8Array", () => {
    const key = ["blobs", new Uint8Array([1, 2, 3])];
    const expected = ["blobs", { type: "Uint8Array", value: "new Uint8Array([1,2,3])" }];
    expect(serializeKvKey(key)).toEqual(expected);
  });

  it("should serialize a key with special number values (NaN and Infinity)", () => {
    const key = ["special", NaN, Infinity, -Infinity];
    const expected = [
      "special",
      { type: "Number", value: "NaN" },
      { type: "Number", value: "Infinity" },
      { type: "Number", value: "-Infinity" }
    ];
    expect(serializeKvKey(key)).toEqual(expected);
  });

  it("should serialize a key with all expected values", () => {
    const key = ["users", 123n, new Uint8Array([4, 5, 6]), Infinity, NaN, false, 555];
    const expected = [
      "users",
      { type: "BigInt", value: "123" },
      { type: "Uint8Array", value: "new Uint8Array([4,5,6])" },
      { type: "Number", value: "Infinity" },
      { type: "Number", value: "NaN" },
      false,
      555,
    ];
    expect(serializeKvKey(key)).toEqual(expected);
  });

  it("should throw an error for unexpected key parts", () => {
    const errorMessage = "Invalid Key Part. The key should contain only string, number, bigint, boolean or Uint8Array"
    // @ts-expect-error - Testing invalid key part
    expect(() => serializeKvKey([{ some: "object" }])).toThrow(errorMessage);

    // @ts-expect-error - Testing invalid key part
    expect(() => serializeKvKey([null])).toThrow(errorMessage);

    // @ts-expect-error - Testing invalid key part
    expect(() => serializeKvKey([undefined])).toThrow(errorMessage);

    // @ts-expect-error - Testing invalid key part
    expect(() => serializeKvKey([["another", "array"]])).toThrow(errorMessage);
  });
});

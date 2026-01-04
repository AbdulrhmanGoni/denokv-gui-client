import { describe, it, expect } from "vitest";
import { deserializeKvKey } from "../../src/index.ts";

describe("Test deserializeKvKey function", () => {
  it("should parse a KvKey with different primitive types", () => {
    const key = '["posts", 123, true]';
    const expected = ["posts", 123, true];
    expect(deserializeKvKey(key)).toEqual(expected);
  });

  it("should parse a KvKey with Infinity and -Infinity values", () => {
    const key =
      '[44, { "type": "Number", "value": "Infinity" }, { "type": "Number", "value": "-Infinity" }]';
    const expected = [44, Infinity, -Infinity];
    expect(deserializeKvKey(key)).toEqual(expected);
  });

  it("should parse a KvKey with a NaN value", () => {
    const key = '[{ "type": "Number", "value": "NaN" }, 45845, "K"]';
    const expected = [NaN, 45845, "K"];
    expect(deserializeKvKey(key)).toEqual(expected);
  });

  it("should parse a KvKey with a regular number in the custom form", () => {
    const key = '[{ "type": "Number", "value": "123" }, { "type": "Number", "value": 1234 }]';
    const expected = [123, 1234];
    expect(deserializeKvKey(key)).toEqual(expected);
  });

  it("should parse a KvKey with a BigInt value", () => {
    const key =
      '[{ "type": "BigInt", "value": "1234567890123" }, { "type": "BigInt", "value": 123456 }]';
    const expected = [1234567890123n, 123456n];
    expect(deserializeKvKey(key)).toEqual(expected);
  });

  it("should parse a KvKey with a Uint8Array value", () => {
    const key = '[{ "type": "Uint8Array", "value": "new Uint8Array([1, 2, 3, 4])" }, 1000]';
    const expected = [new Uint8Array([1, 2, 3, 4]), 1000];
    expect(deserializeKvKey(key)).toEqual(expected);
  });

  it("should throw an error for invalid JSON", () => {
    const key = '["users", "alice"';
    expect(() => deserializeKvKey(key)).toThrow(
      "Invalid JSON format for KvKey.",
    );
  });

  it("should throw an error for a non-array KvKey", () => {
    const key = '{"a": 1}';
    expect(() => deserializeKvKey(key)).toThrow("KvKey must be an array.");
  });

  it("should throw an error for an empty KvKey by default", () => {
    const key = "[]";
    expect(() => deserializeKvKey(key)).toThrow("KvKey must not be empty.");
  });

  it("should allow an empty KvKey when the option is set", () => {
    const key = "[]";
    expect(deserializeKvKey(key, { allowEmptyKey: true })).toEqual([]);
  });

  it("should throw an error for an invalid KvKey part", () => {
    const key = "[null]";
    expect(() => deserializeKvKey(key)).toThrow(
      "Invalid JSON representation for a KvKey part.",
    );
  });

  it("should throw an error for an invalid BigInt value", () => {
    const key = '[{ "type": "BigInt", "value": "not-a-bigint" }]';
    expect(() => deserializeKvKey(key)).toThrow("Invalid BigInt value:");
  });

  it("should throw an error for an invalid Uint8Array value", () => {
    const key = '[{ "type": "Uint8Array", "value": "invalid-Uint8Array" }]';
    expect(() => deserializeKvKey(key)).toThrow(
      "Invalid Uint8Array value: ",
    );
  });
});

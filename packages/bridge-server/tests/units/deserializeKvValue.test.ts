import { describe, it, expect } from "vitest";
import { deserializeKvValue } from "../../src/index.ts";

describe("deserializeKvValue", () => {
  it("should deserialize numbers", () => {
    const result = deserializeKvValue({ type: "Number", data: 42 });
    expect(result).toEqual(42);
  });

  it("should deserialize string numbers", () => {
    const result = deserializeKvValue({ type: "Number", data: "123" });
    expect(result).toEqual(123);
  });

  it("should deserialize strings", () => {
    const result = deserializeKvValue({ type: "String", data: "deno" });
    expect(result).toEqual("deno");
  });

  it("should deserialize booleans", () => {
    const result = deserializeKvValue({ type: "Boolean", data: true });
    expect(result).toEqual(true);
  });

  it("should deserialize boolean strings", () => {
    const result = deserializeKvValue({ type: "Boolean", data: "false" });
    expect(result).toEqual(false);
  });

  it("should deserialize BigInt values", () => {
    const result = deserializeKvValue({
      type: "BigInt",
      data: "9007199254740991",
    });
    expect(result).toEqual(9007199254740991n);
  });

  it("should deserialize KvU64 values", () => {
    const result = deserializeKvValue({ type: "KvU64", data: "77" }) as {
      value: bigint;
    };
    expect(result.value).toEqual(77n);
  });

  it("should deserialize dates", () => {
    const isoDate = "2020-01-01T00:00:00.000Z";
    const result = deserializeKvValue({ type: "Date", data: isoDate });
    expect(result).toEqual(new Date(isoDate));
  });

  it("should deserialize undefined values", () => {
    const result = deserializeKvValue({ type: "Undefined", data: "undefined" });
    expect(result).toEqual(undefined);
  });

  it("should deserialize null values", () => {
    const result = deserializeKvValue({ type: "Null", data: "null" });
    expect(result).toEqual(null);
  });

  it("should deserialize objects", () => {
    const result = deserializeKvValue({
      type: "Object",
      data: '{"foo":"bar"}',
    });
    expect(result).toEqual({ foo: "bar" });
  });

  it("should deserialize arrays", () => {
    const result = deserializeKvValue({
      type: "Array",
      data: '["foo",1,true,{arr:[0]}]',
    });
    expect(result).toEqual(["foo", 1, true, { arr: [0] }]);
  });

  it("should deserialize sets", () => {
    const result = deserializeKvValue({
      type: "Set",
      data: "new Set([1,2,3])",
    });
    expect(result).toBeInstanceOf(Set);
    expect(result).toEqual(new Set([1, 2, 3]));
  });

  it("should deserialize maps", () => {
    const result = deserializeKvValue({
      type: "Map",
      data: 'new Map([["key","value"]])',
    });
    expect(result).toBeInstanceOf(Map);
    expect(result).toEqual(new Map([["key", "value"]]));
  });

  it("should deserialize regular expressions", () => {
    const result = deserializeKvValue({
      type: "RegExp",
      data: JSON.stringify({ source: "^test-\\w", flags: "gi" }),
    }) as RegExp;
    expect(result).toBeInstanceOf(RegExp);
    expect(result.source).toEqual("^test-\\w");
    expect(result.flags).toEqual("gi");
  });

  it("should deserialize Uint8Arrays", () => {
    const result = deserializeKvValue({
      type: "Uint8Array",
      data: "new Uint8Array([1,2,3])",
    });
    expect(result).toBeInstanceOf(Uint8Array);
    expect(Array.from(result as Uint8Array)).toEqual([1, 2, 3]);
  });

  it("should throw on unsupported types", () => {
    expect(() => deserializeKvValue({ type: "Custom", data: "{}" })).toThrow(
      "Unsupported Data Type: Custom",
    );
  });
});

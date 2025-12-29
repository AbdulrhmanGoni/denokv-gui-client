import { describe, it, expect } from "vitest";
import { deserializeKvValue } from "../../src/index.ts";
import { openKv } from "@deno/kv";

const kv = await openKv()

describe("deserializeKvValue", () => {
    it("should deserialize numbers", async () => {
        const result = await deserializeKvValue({ type: "Number", data: 42 }, kv);
        expect(result).toEqual(42);
    });

    it("should deserialize string numbers", async () => {
        const result = await deserializeKvValue({ type: "Number", data: "123" }, kv);
        expect(result).toEqual(123);
    });

    it("should deserialize strings", async () => {
        const result = await deserializeKvValue({ type: "String", data: "deno" }, kv);
        expect(result).toEqual("deno");
    });

    it("should deserialize booleans", async () => {
        const result = await deserializeKvValue({ type: "Boolean", data: true }, kv);
        expect(result).toEqual(true);
    });

    it("should deserialize boolean strings", async () => {
        const result = await deserializeKvValue({ type: "Boolean", data: "false" }, kv);
        expect(result).toEqual(false);
    });

    it("should deserialize BigInt values", async () => {
        const result = await deserializeKvValue({ type: "BigInt", data: "9007199254740991" }, kv);
        expect(result).toEqual(9007199254740991n);
    });

    it("should deserialize KvU64 values", async () => {
        const result = await deserializeKvValue({ type: "KvU64", data: "77" }, kv) as { value: bigint };
        expect(result.value).toEqual(77n);
    });

    it("should deserialize dates", async () => {
        const isoDate = "2020-01-01T00:00:00.000Z";
        const result = await deserializeKvValue({ type: "Date", data: isoDate }, kv);
        expect(result).toEqual(new Date(isoDate));
    });

    it("should deserialize undefined values", async () => {
        const result = await deserializeKvValue({ type: "Undefined", data: "undefined" }, kv);
        expect(result).toEqual(undefined);
    });

    it("should deserialize null values", async () => {
        const result = await deserializeKvValue({ type: "Null", data: "null" }, kv);
        expect(result).toEqual(null);
    });

    it("should deserialize objects", async () => {
        const result = await deserializeKvValue({ type: "Object", data: '{"foo":"bar"}' }, kv);
        expect(result).toEqual({ foo: "bar" });
    });

    it("should deserialize arrays", async () => {
        const result = await deserializeKvValue({ type: "Array", data: '["foo",1,true,{arr:[0]}]' }, kv);
        expect(result).toEqual(["foo", 1, true, { arr: [0] }]);
    });

    it("should deserialize sets", async () => {
        const result = await deserializeKvValue({ type: "Set", data: "new Set([1,2,3])" }, kv) as Set<number>;
        expect(result).toBeInstanceOf(Set);
        expect(result).toEqual(new Set([1, 2, 3]));
    });

    it("should deserialize maps", async () => {
        const result = await deserializeKvValue(
            { type: "Map", data: 'new Map([["key","value"]])' },
            kv,
        ) as Map<string, string>;
        expect(result).toBeInstanceOf(Map);
        expect(result).toEqual(new Map([["key", "value"]]));
    });

    it("should deserialize regular expressions", async () => {
        const result = await deserializeKvValue(
            { type: "RegExp", data: JSON.stringify({ source: "^test-\\w", flags: "gi" }) },
            kv,
        ) as RegExp;
        expect(result).toBeInstanceOf(RegExp);
        expect(result.source).toEqual("^test-\\w");
        expect(result.flags).toEqual("gi");
    });

    it("should deserialize Uint8Arrays", async () => {
        const result = await deserializeKvValue(
            { type: "Uint8Array", data: "new Uint8Array([1,2,3])" },
            kv,
        ) as Uint8Array;
        expect(result).toBeInstanceOf(Uint8Array);
        expect(Array.from(result)).toEqual([1, 2, 3]);
    });

    it("should throw on unsupported types", async () => {
        await expect(
            deserializeKvValue({ type: "Custom", data: "{}" }, kv),
        ).rejects.toThrow("Unsupported Data Type: Custom");
    });
});



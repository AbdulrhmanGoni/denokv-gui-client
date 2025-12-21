import { describe, it, expect } from "vitest";
import { serializeKvValue } from "../../src/index.ts";

describe("serializeKvValue", () => {
    it("should serialize strings", () => {
        const result = serializeKvValue("deno");
        expect(result).toEqual({ type: "String", data: "deno" });
    });

    it("should serialize numbers", () => {
        const result = serializeKvValue(42);
        expect(result).toEqual({ type: "Number", data: 42 });
    });

    it("should serialize booleans", () => {
        const result = serializeKvValue(true);
        expect(result).toEqual({ type: "Boolean", data: true });
    });

    it("should serialize BigInt values", () => {
        const result = serializeKvValue(1234567890123456789n);
        expect(result).toEqual({
            type: "BigInt",
            data: "1234567890123456789",
        });
    });

    it("should serialize undefined values", () => {
        const result = serializeKvValue(undefined);
        expect(result).toEqual({ type: "Undefined", data: "undefined" });
    });

    it("should serialize null values", () => {
        const result = serializeKvValue(null);
        expect(result).toEqual({ type: "Null", data: "null" });
    });

    it("should serialize KvU64 values", () => {
        const value = Object.assign(
            Object.create({ constructor: { name: "KvU64" } }), { value: 99n }
        );
        const result = serializeKvValue(value);
        expect(result).toEqual({ type: "KvU64", data: "99" });
    });

    it("should serialize arrays", () => {
        const result = serializeKvValue(["foo", 1, true]);
        expect(result).toEqual({ type: "Array", data: '["foo",1,true]' });
    });

    it("should serialize dates", () => {
        const date = new Date("2020-01-01T00:00:00.000Z");
        const result = serializeKvValue(date);
        expect(result).toEqual({
            type: "Date",
            data: "2020-01-01T00:00:00.000Z",
        });
    });

    it("should serialize maps", () => {
        const map = new Map([["key", "value"]]);
        const result = serializeKvValue(map);
        expect(result).toEqual({
            type: "Map",
            data: 'new Map([["key","value"]])',
        });
    });

    it("should serialize sets", () => {
        const set = new Set([1, 2]);
        const result = serializeKvValue(set);
        expect(result).toEqual({
            type: "Set",
            data: "new Set([1,2])",
        });
    });

    it("should serialize regular expressions", () => {
        const regex = /^test-\w/gi;
        const result = serializeKvValue(regex);
        expect(result).toEqual({
            type: "RegExp",
            data: '{"source":"^test-\\\\w","flags":"gi"}',
        });
    });

    it("should serialize Uint8Array values", () => {
        const bytes = new Uint8Array([4, 5, 6, 0, 9]);
        const result = serializeKvValue(bytes);
        expect(result).toEqual({
            type: "Uint8Array",
            data: "new Uint8Array([4,5,6,0,9])",
        });
    });

    it("should serialize plain objects", () => {
        const result = serializeKvValue({ foo: "bar", bar: "foo" });
        expect(result).toEqual({
            type: "Object",
            data: '{"foo":"bar","bar":"foo"}',
        });
    });
});


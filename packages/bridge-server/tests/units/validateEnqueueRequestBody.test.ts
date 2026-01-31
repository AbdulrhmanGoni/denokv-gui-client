import { describe, it, expect } from "vitest";
import { validateEnqueueRequest } from "../../src/index.ts";
import { openKv } from "@deno/kv";

const kv = await openKv();

describe("Test 'validateEnqueueRequest' function", () => {
    it("should validate a simple enqueue request body with a string value", async () => {
        const body = {
            value: { type: "String", data: "hello world" },
        };
        const result = await validateEnqueueRequest(body, kv);
        expect(result).toEqual({
            value: "hello world",
            options: undefined,
        });
    });

    it("should validate an enqueue request body with a number value", async () => {
        const body = {
            value: { type: "Number", data: 42 },
        };
        const result = await validateEnqueueRequest(body, kv);
        expect(result).toEqual({
            value: 42,
            options: undefined,
        });
    });

    it("should validate an enqueue request body with an object value", async () => {
        const body = {
            value: { type: "Object", data: '{"foo":"bar","count":123}' },
        };
        const result = await validateEnqueueRequest(body, kv);
        expect(result).toEqual({
            value: { foo: "bar", count: 123 },
            options: undefined,
        });
    });

    it("should validate an enqueue request body with delay option", async () => {
        const body = {
            value: { type: "String", data: "test" },
            options: {
                delay: 5000,
            },
        };
        const result = await validateEnqueueRequest(body, kv);
        expect(result).toEqual({
            value: "test",
            options: {
                delay: 5000,
            },
        });
    });

    it("should validate an enqueue request body with backoffSchedule option", async () => {
        const body = {
            value: { type: "String", data: "test" },
            options: {
                backoffSchedule: [100, 200, 400, 800],
            },
        };
        const result = await validateEnqueueRequest(body, kv);
        expect(result).toEqual({
            value: "test",
            options: {
                backoffSchedule: [100, 200, 400, 800],
            },
        });
    });

    it("should validate an enqueue request body with keysIfUndelivered option", async () => {
        const body = {
            value: { type: "String", data: "test" },
            options: {
                keysIfUndelivered: '[["failed","messages",1], ["failed","messages",2]]',
            },
        };
        const result = await validateEnqueueRequest(body, kv);
        expect(result).toEqual({
            value: "test",
            options: {
                keysIfUndelivered: [
                    ["failed", "messages", 1],
                    ["failed", "messages", 2],
                ],
            },
        });
    });

    it("should validate an enqueue request body with all options", async () => {
        const body = {
            value: { type: "Object", data: '{"task":"process","id":123}' },
            options: {
                delay: 1000,
                backoffSchedule: [100, 500, 1000],
                keysIfUndelivered: '[["dlq","task",123]]',
            },
        };
        const result = await validateEnqueueRequest(body, kv);
        expect(result).toEqual({
            value: { task: "process", id: 123 },
            options: {
                delay: 1000,
                backoffSchedule: [100, 500, 1000],
                keysIfUndelivered: [["dlq", "task", 123]],
            },
        });
    });

    it("should throw an error for non-object body", async () => {
        await expect(validateEnqueueRequest("not an object", kv)).rejects.toThrow(
            "Invalid enqueue request body",
        );
    });

    it("should throw an error for undefined body", async () => {
        await expect(validateEnqueueRequest(undefined, kv)).rejects.toThrow(
            "Invalid enqueue request body",
        );
    });

    it("should throw an error for body without value", async () => {
        const body = {
            options: { delay: 1000 },
        };
        await expect(validateEnqueueRequest(body, kv)).rejects.toThrow(
            "Invalid enqueue request body: must have a value",
        );
    });

    it("should throw an error for non-object options", async () => {
        const body = {
            value: { type: "String", data: "test" },
            options: "not an object",
        };
        await expect(validateEnqueueRequest(body, kv)).rejects.toThrow(
            "'options' of 'enqueue' operation should be an object when set",
        );
    });

    it("should throw an error for non-array backoffSchedule", async () => {
        const body = {
            value: { type: "String", data: "test" },
            options: {
                backoffSchedule: "not an array",
            },
        };
        await expect(validateEnqueueRequest(body, kv)).rejects.toThrow(
            "'backoffSchedule' option of 'enqueue' operation should be an array of numbers",
        );
    });

    it("should throw an error for non-number delay", async () => {
        const body = {
            value: { type: "String", data: "test" },
            options: {
                delay: "not a number",
            },
        };
        await expect(validateEnqueueRequest(body, kv)).rejects.toThrow(
            "'delay' option of 'enqueue' operation should be a number",
        );
    });

    it("should throw an error for non-array keysIfUndelivered", async () => {
        const body = {
            value: { type: "String", data: "test" },
            options: {
                keysIfUndelivered: "not an array",
            },
        };
        await expect(validateEnqueueRequest(body, kv)).rejects.toThrow(
            "'keysIfUndelivered' option of 'enqueue' operation should be an array of valid Kv Keys in the serialized form as string",
        );
    });

    it("should throw an error for invalid KvKey in keysIfUndelivered", async () => {
        const body = {
            value: { type: "String", data: "test" },
            options: {
                keysIfUndelivered: '[["valid"], ["invalid", {}]]',
            },
        };
        await expect(validateEnqueueRequest(body, kv)).rejects.toThrow(
            "'keysIfUndelivered' option of 'enqueue' operation contains at least one invalid Kv Key",
        );
    });

    it("should validate an enqueue request body with empty options object", async () => {
        const body = {
            value: { type: "String", data: "test" },
            options: {},
        };
        const result = await validateEnqueueRequest(body, kv);
        expect(result).toEqual({
            value: "test",
            options: {},
        });
    });

    it("should validate an enqueue request body with complex value types", async () => {
        const body = {
            value: {
                type: "Array",
                data: '[1,2,{"nested":true},"string",null,[new Set(["test1", "test2"])]]',
            },
        };
        const result = await validateEnqueueRequest(body, kv);
        expect(result).toEqual({
            value: [1, 2, { nested: true }, "string", null, [new Set(["test1", "test2"])]],
            options: undefined,
        });
    });

    it("should validate an enqueue request body with BigInt value", async () => {
        const body = {
            value: { type: "BigInt", data: "9007199254740991" },
        };
        const result = await validateEnqueueRequest(body, kv);
        expect(result).toEqual({
            value: 9007199254740991n,
            options: undefined,
        });
    });

    it("should validate an enqueue request body with Date value", async () => {
        const isoDate = "2024-01-01T00:00:00.000Z";
        const body = {
            value: { type: "Date", data: isoDate },
        };
        const result = await validateEnqueueRequest(body, kv);
        expect(result).toEqual({
            value: new Date(isoDate),
            options: undefined,
        });
    });

    it("should validate an enqueue request body with null value", async () => {
        const body = {
            value: { type: "Null", data: "null" },
        };
        const result = await validateEnqueueRequest(body, kv);
        expect(result).toEqual({
            value: null,
            options: undefined,
        });
    });

    it("should validate an enqueue request body with undefined value", async () => {
        const body = {
            value: { type: "Undefined", data: "undefined" },
        };
        const result = await validateEnqueueRequest(body, kv);
        expect(result).toEqual({
            value: undefined,
            options: undefined,
        });
    });
});

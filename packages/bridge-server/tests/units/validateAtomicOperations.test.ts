import { describe, it, expect } from "vitest";
import { validateAtomicOperations } from "../../src/index.ts";
import { openKv } from "@deno/kv";

const kv = await openKv();

describe("Test 'validateAtomicOperations' function", () => {
    it("should validate a list of various valid atomic operations", async () => {
        const operations = [
            { name: "check", key: "['users', 1]", versionstamp: "00000000000000010000" },
            { name: "set", key: "['users', 1]", value: { type: "String", data: "updated" } },
            { name: "delete", key: "['users', 2]" },
            { name: "sum", key: "['stats', 'logins']", value: 1 },
            { name: "min", key: "['stats', 'min_val']", value: 5 },
            { name: "max", key: "['stats', 'max_val']", value: 10 },
            { name: "enqueue", value: { type: "String", data: "msg" } }
        ];

        const result = await validateAtomicOperations(operations, kv);

        expect(result).toEqual([
            { name: "check", key: ["users", 1], versionstamp: "00000000000000010000" },
            { name: "set", key: ["users", 1], value: "updated", expiresIn: undefined },
            { name: "delete", key: ["users", 2] },
            { name: "sum", key: ["stats", "logins"], value: 1n },
            { name: "min", key: ["stats", "min_val"], value: 5n },
            { name: "max", key: ["stats", "max_val"], value: 10n },
            { name: "enqueue", value: "msg", options: undefined }
        ]);
    });

    it("should throw an error if input is not an array", async () => {
        await expect(validateAtomicOperations("not an array", kv)).rejects.toThrow(
            "Invalid atomic operation: Must be an array of at least one valid `ValidAtomicOperation` object representing a Deno Kv atomic operation"
        );
    });

    it("should throw an error if array is empty", async () => {
        await expect(validateAtomicOperations([], kv)).rejects.toThrow(
            "Invalid atomic operation: Must be an array of at least one valid `ValidAtomicOperation` object representing a Deno Kv atomic operation"
        );
    });

    it("should throw an error if an operation is missing a name", async () => {
        const operations = [
            { key: "['users', 1]" }
        ];
        await expect(validateAtomicOperations(operations as any, kv)).rejects.toThrow(
            "Invalid atomic operation: no atomic operation name provided"
        );
    });

    it("should throw an error for unsupported operation", async () => {
        const operations = [
            { name: "invalid_op", key: "['users', 1]" }
        ];
        await expect(validateAtomicOperations(operations as any, kv)).rejects.toThrow(
            'Invalid atomic operation: Unknown or unsupported atomic operation: "invalid_op"'
        );
    });

    it("should throw an error for invalid key (not valid serialised KvKey)", async () => {
        const operations = [
            { name: "delete", key: "['invalid' , {}]" }
        ];
        await expect(validateAtomicOperations(operations, kv)).rejects.toThrow(
            "Invalid atomic operation: the key passed to the 'delete' operation is invalid Deno Kv key"
        );
    });

    it("should handle null versionstamp in 'check' operation", async () => {
        const operations = [
            { name: "check", key: "['users', 1]", versionstamp: null }
        ];
        const result = await validateAtomicOperations(operations, kv);
        expect(result[0]).toEqual({
            name: "check",
            key: ["users", 1],
            versionstamp: null
        });
    });

    it("should throw error for invalid versionstamp in 'check' operation", async () => {
        const operations = [
            { name: "check", key: "['users', 1]", versionstamp: 123 }
        ];
        await expect(validateAtomicOperations(operations as any, kv)).rejects.toThrow(
            "Invalid atomic operation: versionstamp of 'check' operation must be either null or a non-empty string"
        );
    });

    it("should throw error for empty string versionstamp in 'check' operation", async () => {
        const operations = [
            { name: "check", key: "['users', 1]", versionstamp: "" }
        ];
        await expect(validateAtomicOperations(operations as any, kv)).rejects.toThrow(
            "Invalid atomic operation: versionstamp of 'check' operation must be either null or a non-empty string"
        );
    });

    it("should validate 'set' with expiresIn", async () => {
        const operations = [
            { name: "set", key: "['users', 1]", value: { type: "Number", data: 123 }, expiresIn: 5000 }
        ];
        const result = await validateAtomicOperations(operations, kv);
        expect(result[0]).toEqual({
            name: "set",
            key: ["users", 1],
            value: 123,
            expiresIn: 5000
        });
    });

    it("should throw error for missing key in 'set' operation", async () => {
        const operations = [
            { name: "set", value: { type: "Number", data: 123 } }
        ];
        await expect(validateAtomicOperations(operations as any, kv)).rejects.toThrow(
            "Invalid atomic operation: 'set' operation must have a key"
        );
    });

    it("should throw error for non-number value in 'sum' operation", async () => {
        const operations = [
            { name: "sum", key: "['a']", value: "not a number" }
        ];
        await expect(validateAtomicOperations(operations as any, kv)).rejects.toThrow(
            "Invalid atomic operation: 'sum' operation must have an integer value"
        );
    });

    it("should throw error for missing value in 'sum' operation", async () => {
        const operations = [
            { name: "sum", key: "['a']" }
        ];
        await expect(validateAtomicOperations(operations as any, kv)).rejects.toThrow(
            "Invalid atomic operation: 'sum' operation must have an integer value"
        );
    });

    it("should throw error for non-integer number value in 'sum' operation", async () => {
        const operations = [
            { name: "sum", key: "['a']", value: 1.5 }
        ];
        await expect(validateAtomicOperations(operations as any, kv)).rejects.toThrow();
    });

    it("should validate 'enqueue' with all options", async () => {
        const operations = [
            {
                name: "enqueue",
                value: { type: "Object", data: '{"job":"test"}' },
                options: {
                    delay: 1000,
                    backoffSchedule: [100, 200],
                    keysIfUndelivered: '[["dlq"]]'
                }
            }
        ];
        const result = await validateAtomicOperations(operations, kv);
        expect(result[0]).toEqual({
            name: "enqueue",
            value: { job: "test" },
            options: {
                delay: 1000,
                backoffSchedule: [100, 200],
                keysIfUndelivered: [["dlq"]]
            }
        });
    });
});

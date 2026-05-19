import { describe, it, expect } from "vitest";
import type { TestDependencies } from "./index.test.ts";

export function enqueueEndpointSpec({ bridgeServerClient }: TestDependencies) {
    describe("'POST /enqueue' endpoint's specifications", () => {
        it("should enqueue a message successfully", async () => {
            const value = {
                type: "Object",
                data: JSON.stringify({ hello: "world" }),
            };

            const res = await bridgeServerClient.enqueue(value);
            expect(res.result).toEqual(true);
        });

        it("should enqueue a message with options successfully", async () => {
            const value = {
                type: "String",
                data: "message with options",
            };
            const options = {
                delay: 1000,
                keysIfUndelivered: " [['undelivered', 'key']] ",
            };

            const res = await bridgeServerClient.enqueue(value, options);
            expect(res.result).toEqual(true);
        });

        it("should fail if value is missing", async () => {
            const res = await bridgeServerClient.enqueue(undefined as any);
            expect(res.result).toBe(null);
            expect(res.error).toMatch(/must have a value/i);
        });
    });
}

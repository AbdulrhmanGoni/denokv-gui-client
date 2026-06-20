import { describe, it, expect } from "vitest";
import { validateEnqueueRequest } from "../../src/index.ts";

describe("Test 'validateEnqueueRequest' function", () => {
  it("should validate a simple enqueue request body with a string value", () => {
    const body = {
      value: { type: "String", data: "hello world" },
    };
    const result = validateEnqueueRequest(body);
    expect(result).toEqual({
      value: "hello world",
      options: undefined,
    });
  });

  it("should validate an enqueue request body with a number value", () => {
    const body = {
      value: { type: "Number", data: 42 },
    };
    const result = validateEnqueueRequest(body);
    expect(result).toEqual({
      value: 42,
      options: undefined,
    });
  });

  it("should validate an enqueue request body with an object value", () => {
    const body = {
      value: { type: "Object", data: '{"foo":"bar","count":123}' },
    };
    const result = validateEnqueueRequest(body);
    expect(result).toEqual({
      value: { foo: "bar", count: 123 },
      options: undefined,
    });
  });

  it("should validate an enqueue request body with delay option", () => {
    const body = {
      value: { type: "String", data: "test" },
      options: {
        delay: 5000,
      },
    };
    const result = validateEnqueueRequest(body);
    expect(result).toEqual({
      value: "test",
      options: {
        delay: 5000,
      },
    });
  });

  it("should validate an enqueue request body with backoffSchedule option", () => {
    const body = {
      value: { type: "String", data: "test" },
      options: {
        backoffSchedule: [100, 200, 400, 800],
      },
    };
    const result = validateEnqueueRequest(body);
    expect(result).toEqual({
      value: "test",
      options: {
        backoffSchedule: [100, 200, 400, 800],
      },
    });
  });

  it("should validate an enqueue request body with keysIfUndelivered option", () => {
    const body = {
      value: { type: "String", data: "test" },
      options: {
        keysIfUndelivered: '[["failed","messages",1], ["failed","messages",2]]',
      },
    };
    const result = validateEnqueueRequest(body);
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

  it("should validate an enqueue request body with all options", () => {
    const body = {
      value: { type: "Object", data: '{"task":"process","id":123}' },
      options: {
        delay: 1000,
        backoffSchedule: [100, 500, 1000],
        keysIfUndelivered: '[["dlq","task",123]]',
      },
    };
    const result = validateEnqueueRequest(body);
    expect(result).toEqual({
      value: { task: "process", id: 123 },
      options: {
        delay: 1000,
        backoffSchedule: [100, 500, 1000],
        keysIfUndelivered: [["dlq", "task", 123]],
      },
    });
  });

  it("should throw an error for non-object body", () => {
    expect(() => validateEnqueueRequest("not an object")).toThrow(
      "Invalid enqueue request body",
    );
  });

  it("should throw an error for undefined body", () => {
    expect(() => validateEnqueueRequest(undefined)).toThrow(
      "Invalid enqueue request body",
    );
  });

  it("should throw an error for body without value", () => {
    const body = {
      options: { delay: 1000 },
    };
    expect(() => validateEnqueueRequest(body)).toThrow(
      "Invalid enqueue request body: must have a value",
    );
  });

  it("should throw an error for non-object options", () => {
    const body = {
      value: { type: "String", data: "test" },
      options: "not an object",
    };
    expect(() => validateEnqueueRequest(body)).toThrow(
      "'options' of 'enqueue' operation should be an object when set",
    );
  });

  it("should throw an error for non-array backoffSchedule", () => {
    const body = {
      value: { type: "String", data: "test" },
      options: {
        backoffSchedule: "not an array",
      },
    };
    expect(() => validateEnqueueRequest(body)).toThrow(
      "'backoffSchedule' option of 'enqueue' operation should be an array of numbers",
    );
  });

  it("should throw an error for non-number delay", () => {
    const body = {
      value: { type: "String", data: "test" },
      options: {
        delay: "not a number",
      },
    };
    expect(() => validateEnqueueRequest(body)).toThrow(
      "'delay' option of 'enqueue' operation should be a number",
    );
  });

  it("should throw an error for non-array keysIfUndelivered", () => {
    const body = {
      value: { type: "String", data: "test" },
      options: {
        keysIfUndelivered: "not an array",
      },
    };
    expect(() => validateEnqueueRequest(body)).toThrow(
      "'keysIfUndelivered' option of 'enqueue' operation should be an array of valid Kv Keys in the serialized form as string",
    );
  });

  it("should throw an error for invalid KvKey in keysIfUndelivered", () => {
    const body = {
      value: { type: "String", data: "test" },
      options: {
        keysIfUndelivered: '[["valid"], ["invalid", {}]]',
      },
    };
    expect(() => validateEnqueueRequest(body)).toThrow(
      "'keysIfUndelivered' option of 'enqueue' operation contains at least one invalid Kv Key",
    );
  });

  it("should validate an enqueue request body with empty options object", () => {
    const body = {
      value: { type: "String", data: "test" },
      options: {},
    };
    const result = validateEnqueueRequest(body);
    expect(result).toEqual({
      value: "test",
      options: {},
    });
  });

  it("should validate an enqueue request body with complex value types", () => {
    const body = {
      value: {
        type: "Array",
        data: '[1,2,{"nested":true},"string",null,[new Set(["test1", "test2"])]]',
      },
    };
    const result = validateEnqueueRequest(body);
    expect(result).toEqual({
      value: [
        1,
        2,
        { nested: true },
        "string",
        null,
        [new Set(["test1", "test2"])],
      ],
      options: undefined,
    });
  });

  it("should validate an enqueue request body with BigInt value", () => {
    const body = {
      value: { type: "BigInt", data: "9007199254740991" },
    };
    const result = validateEnqueueRequest(body);
    expect(result).toEqual({
      value: 9007199254740991n,
      options: undefined,
    });
  });

  it("should validate an enqueue request body with Date value", () => {
    const isoDate = "2024-01-01T00:00:00.000Z";
    const body = {
      value: { type: "Date", data: isoDate },
    };
    const result = validateEnqueueRequest(body);
    expect(result).toEqual({
      value: new Date(isoDate),
      options: undefined,
    });
  });

  it("should validate an enqueue request body with null value", () => {
    const body = {
      value: { type: "Null", data: "null" },
    };
    const result = validateEnqueueRequest(body);
    expect(result).toEqual({
      value: null,
      options: undefined,
    });
  });

  it("should validate an enqueue request body with undefined value", () => {
    const body = {
      value: { type: "Undefined", data: "undefined" },
    };
    const result = validateEnqueueRequest(body);
    expect(result).toEqual({
      value: undefined,
      options: undefined,
    });
  });
});

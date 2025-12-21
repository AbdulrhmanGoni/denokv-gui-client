import { describe, it, expect } from "vitest";
import { validateSetRequestParams } from "../../src/index.ts";

describe("Test 'validateSetRequestParams' function", () => {
  const fakeUrl = "http://localhost:8000"

  it("should parse a URL with a key", () => {
    const key =
      '["users", 6, { "type": "BigInt", "value": "12345678901234567890" }, { "type": "Number", "value": "Infinity" }]'

    const url = new URL(fakeUrl + '/set?key=' + key);
    const expected = {
      key: ["users", 6, 12345678901234567890n, Infinity]
    };
    expect(validateSetRequestParams(url)).toEqual(expected);
  });

  it("should parse a URL with a key and a valid expiration time", () => {
    const expireIn = 10000;
    const url = new URL(
      `${fakeUrl}/set?key=["users", 6]&expires=${expireIn}`,
    );
    const expected = { key: ["users", 6], expires: expireIn };
    expect(validateSetRequestParams(url)).toEqual(expected);
  });

  it("should throw an error for missing key", () => {
    const url = new URL(fakeUrl + "/set");
    expect(() => validateSetRequestParams(url)).toThrow(
      "No target key to set.",
    );
  });

  it("should throw an error for a non-numeric expiration time", () => {
    const url = new URL(
      fakeUrl + '/set?key=["users", "dave"]&expires=not-a-number',
    );
    expect(() => validateSetRequestParams(url)).toThrow(
      "Invalid expiration time option: It must be a number in milliseconds. Got: not-a-number",
    );
  });
});

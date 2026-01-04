import { describe, it, expect } from "vitest";
import { validateBrowseRequestParams } from "../../src/index.ts";

describe("Test 'validateBrowseRequestParams' function", () => {
  const fakeUrl = "http://localhost:8000"

  it("should parse a URL with no parameters and return the default values", () => {
    const url = new URL(fakeUrl + "/list");
    const result = validateBrowseRequestParams(url);
    expect(result.listSelector).toEqual({ prefix: [] });
    expect(result.options).toEqual({
      limit: 40,
      batchSize: undefined,
      consistency: undefined,
      reverse: false,
      cursor: undefined,
    });
  });

  it("should parse a URL with a valid limit option value", () => {
    const url = new URL(fakeUrl + "/list?limit=10");
    const result = validateBrowseRequestParams(url);
    expect(result.options?.limit).toBe(10);
  });

  it("should throw an error for an invalid limit option value", () => {
    const url = new URL(fakeUrl + "/list?limit=-1");
    expect(() => validateBrowseRequestParams(url)).toThrow(
      "Invalid limit option: must be positive integer. Got: -1",
    );
  });

  it("should throw an error for a zero limit option value", () => {
    const url = new URL(fakeUrl + "/list?limit=0");
    expect(() => validateBrowseRequestParams(url)).toThrow(
      "Invalid limit option: must be positive integer. Got: 0",
    );
  });

  it("should parse a URL with a valid batchSize option value", () => {
    const url = new URL(fakeUrl + "/list?batchSize=100");
    const result = validateBrowseRequestParams(url);
    expect(result.options?.batchSize).toBe(100);
  });

  it("should throw an error for an invalid batchSize option value", () => {
    const url = new URL(fakeUrl + "/list?batchSize=abc");
    expect(() => validateBrowseRequestParams(url)).toThrow(
      "Invalid batchSize option: must be positive integer. Got: abc",
    );
  });

  it("should throw an error for a zero batchSize option value", () => {
    const url = new URL(fakeUrl + "/list?batchSize=0");
    expect(() => validateBrowseRequestParams(url)).toThrow(
      "Invalid batchSize option: must be positive integer. Got: 0",
    );
  });

  it("should parse a URL with a cursor option", () => {
    const url = new URL(fakeUrl + "/list?cursor=some-cursor");
    const result = validateBrowseRequestParams(url);
    expect(result.options?.cursor).toBe("some-cursor");
  });

  it("should parse a URL with reverse=true option", () => {
    const url = new URL(fakeUrl + "/list?reverse=true");
    const result = validateBrowseRequestParams(url);
    expect(result.options?.reverse).toBe(true);
  });

  it("should parse a URL with consistency option", () => {
    const url = new URL(fakeUrl + "/list?consistency=eventual");
    const result = validateBrowseRequestParams(url);
    expect(result.options?.consistency).toBe("eventual");
  });

  it("should parse a URL with a prefix key", () => {
    const url = new URL(fakeUrl + '/list?prefix=["users"]');
    const result = validateBrowseRequestParams(url);
    expect(result.listSelector).toEqual({ prefix: ["users"] });
  });

  it("should parse a URL with a start key", () => {
    const url = new URL(fakeUrl + '/list?start=["users", "bob"]');
    const result = validateBrowseRequestParams(url);
    expect(result.listSelector).toEqual({ start: ["users", "bob"] });
  });

  it("should parse a URL with an end key", () => {
    const url = new URL(fakeUrl + '/list?end=["users", "charlie"]');
    const result = validateBrowseRequestParams(url);
    expect(result.listSelector).toEqual({ end: ["users", "charlie"] });
  });

  it("should parse a URL with all parameters", () => {
    const url = new URL(
      fakeUrl + '/list?limit=5&prefix=["posts"]&start=["posts", "2024"]&end=["posts", "2025"]&cursor=another-cursor&reverse=true&batchSize=20&consistency=strong',
    );
    const result = validateBrowseRequestParams(url);
    expect(result).toEqual({
      listSelector: {
        prefix: ["posts"],
        start: ["posts", "2024"],
        end: ["posts", "2025"],
      },
      options: {
        limit: 5,
        batchSize: 20,
        consistency: "strong",
        reverse: true,
        cursor: "another-cursor",
      }
    });
  });
});


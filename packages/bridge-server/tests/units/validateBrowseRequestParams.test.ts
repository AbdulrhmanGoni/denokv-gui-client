import { describe, it, expect } from "vitest";
import { validateBrowseRequestParams } from "../../src/index.ts";

describe("Test 'validateBrowseRequestParams' function", () => {
  const fakeUrl = "http://localhost:8000"

  it("should parse a URL with no parameters and return the default value", () => {
    const url = new URL(fakeUrl + "/list");
    const expected = { listSelector: { prefix: [] } };
    expect(validateBrowseRequestParams(url)).toEqual(expected);
  });

  it("should parse a URL with a valid limit value", () => {
    const url = new URL(fakeUrl + "/list?limit=10");
    const expected = { limit: 10, listSelector: { prefix: [] } };
    expect(validateBrowseRequestParams(url)).toEqual(expected);
  });

  it("should throw an error for an invalid limit value", () => {
    const url = new URL(fakeUrl + "/list?limit=-1");
    expect(() => validateBrowseRequestParams(url)).toThrow(
      "Invalid limit option: must be positive integer. Got: -1",
    );
  });

  it("should parse a URL with a cursor", () => {
    const url = new URL(fakeUrl + "/list?cursor=some-cursor");
    const expected = { cursor: "some-cursor", listSelector: { prefix: [] } };
    expect(validateBrowseRequestParams(url)).toEqual(expected);
  });

  it("should parse a URL with a prefix key", () => {
    const url = new URL(fakeUrl + '/list?prefix=["users"]');
    const expected = { listSelector: { prefix: ["users"] } };
    expect(validateBrowseRequestParams(url)).toEqual(expected);
  });

  it("should parse a URL with a start key", () => {
    const url = new URL(fakeUrl + '/list?start=["users", "bob"]');
    const expected = { listSelector: { start: ["users", "bob"] } };
    expect(validateBrowseRequestParams(url)).toEqual(expected);
  });

  it("should parse a URL with an end key", () => {
    const url = new URL(fakeUrl + '/list?end=["users", "charlie"]');
    const expected = { listSelector: { end: ["users", "charlie"] } };
    expect(validateBrowseRequestParams(url)).toEqual(expected);
  });

  it("should parse a URL with all parameters", () => {
    const url = new URL(
      fakeUrl + '/list?limit=5&prefix=["posts"]&start=["posts", "2024"]&end=["posts", "2025"]&cursor=another-cursor',
    );
    const expected = {
      limit: 5,
      listSelector: {
        prefix: ["posts"],
        start: ["posts", "2024"],
        end: ["posts", "2025"],
      },
      cursor: "another-cursor",
    };
    expect(validateBrowseRequestParams(url)).toEqual(expected);
  });
});

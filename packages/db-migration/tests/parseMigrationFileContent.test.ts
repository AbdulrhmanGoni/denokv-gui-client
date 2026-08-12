import { describe, it, expect } from "vitest";
import path from "path";
import { parseMigrationFileContent } from "../helpers";

const testDataDir = path.join(import.meta.dirname, "data", "for-parsing-test");

type ExceptionTestCase = {
  title: string;
  filePath: string;
  expectedError: string;
};

const exceptionTestCases: ExceptionTestCase[] = [
  {
    title: "Missing '-- migrate:up' block",
    filePath: path.join(testDataDir, "20250802120127_test1.sql"),
    expectedError:
      "No '-- migrate:up' block found before the first '-- migrate:down' block",
  },
  {
    title: "Multiple '-- migrate:up' blocks",
    filePath: path.join(testDataDir, "20250928103303_test2.sql"),
    expectedError: "multiple '-- migrate:up' blocks are not allowed",
  },
  {
    title: "Multiple '-- migrate:down' blocks",
    filePath: path.join(testDataDir, "20250929180946_test3.sql"),
    expectedError: "multiple '-- migrate:down' blocks are not allowed",
  },
  {
    title: "Missing '-- migrate:down' block",
    filePath: path.join(testDataDir, "20251024195646_test4.sql"),
    expectedError: "the '-- migrate:down' block should not be empty",
  },
  {
    title: "Empty '-- migrate:up' blocks",
    filePath: path.join(testDataDir, "20260328190439_test5.sql"),
    expectedError: "the '-- migrate:up' block should not be empty",
  },
  {
    title: "Empty file",
    filePath: path.join(testDataDir, "20260402143135_test6.sql"),
    expectedError: "the '-- migrate:up' block should not be empty",
  },
];

type SuccessTestCase = {
  title: string;
  filePath: string;
  result: {
    upQuery: string;
    downQuery: string;
  };
};

const successTestCases: SuccessTestCase[] = [
  {
    title: "One line statements parsing",
    filePath: path.join(testDataDir, "20260429230505_test7.sql"),
    result: {
      upQuery: "CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT);",
      downQuery: "DROP TABLE users;",
    },
  },
  {
    title: "Multi line statements parsing",
    filePath: path.join(testDataDir, "20260429230505_test8.sql"),
    result: {
      upQuery: `CREATE TABLE keys (
    id TEXT PRIMARY KEY,
    content TEXT UNIQUE NOT NULL
);`,
      downQuery: "DROP TABLE keys;",
    },
  },
];

describe("Testing parseMigrationFileContent", () => {
  for (const testCase of exceptionTestCases) {
    it("[Exception Test]: " + testCase.title, async () => {
      const promise = parseMigrationFileContent(testCase.filePath);
      await expect(promise).rejects.toThrow(testCase.expectedError);
    });
  }

  for (const testCase of successTestCases) {
    it("[Success Test]: " + testCase.title, async () => {
      const result = await parseMigrationFileContent(testCase.filePath);
      expect(result.upQuery.trim()).toEqual(testCase.result.upQuery.trim());
      expect(result.downQuery.trim()).toEqual(testCase.result.downQuery.trim());
    });
  }
});

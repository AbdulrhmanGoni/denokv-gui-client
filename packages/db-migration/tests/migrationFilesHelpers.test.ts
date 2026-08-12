import { DatabaseSync } from "node:sqlite";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { getPendingMigrations, getSingleMigrationFile } from "../helpers";

const firstVersion = 20240101000001n;
const secondVersion = 20240101000002n;
const thirdVersion = 20240101000003n;

describe("migration files helpers", () => {
  let migrationsDir: string;
  let database: DatabaseSync;

  beforeEach(() => {
    migrationsDir = mkdtempSync(path.join(tmpdir(), "db-migration-tests-"));
    database = new DatabaseSync(":memory:");
    database.exec("CREATE TABLE schema_migrations (version VARCHAR(128) PRIMARY KEY)");
  });

  afterEach(() => {
    database.close();
    rmSync(migrationsDir, { recursive: true, force: true });
  });

  describe("getPendingMigrations", () => {
    it("returns unapplied migration files in version order with their metadata", () => {
      writeMigration(thirdVersion, "third");
      writeMigration(firstVersion, "first");
      writeMigration(secondVersion, "second");
      database.exec(
        `INSERT INTO schema_migrations (version) VALUES ('${secondVersion}')`,
      );

      expect(getPendingMigrations(database, migrationsDir)).toEqual([
        {
          version: firstVersion,
          name: "20240101000001_first.sql",
          path: path.join(migrationsDir, "20240101000001_first.sql"),
        },
        {
          version: thirdVersion,
          name: "20240101000003_third.sql",
          path: path.join(migrationsDir, "20240101000003_third.sql"),
        },
      ]);
    });

    it("ignores directories and files that are not valid migration filenames", () => {
      writeMigration(firstVersion, "valid");
      writeFileSync(path.join(migrationsDir, "20240101000002_not-sql.txt"), "");
      writeFileSync(path.join(migrationsDir, "2024010100000_short.sql"), "");
      writeFileSync(path.join(migrationsDir, "2024010100000a_letters.sql"), "");
      writeFileSync(path.join(migrationsDir, "not-a-migration.sql"), "");
      mkdirSync(path.join(migrationsDir, "20240101000003_directory.sql"));

      expect(getPendingMigrations(database, migrationsDir)).toEqual([
        {
          version: firstVersion,
          name: "20240101000001_valid.sql",
          path: path.join(migrationsDir, "20240101000001_valid.sql"),
        },
      ]);
    });

    it("throws when the migrations directory does not exist", () => {
      expect(() =>
        getPendingMigrations(database, path.join(migrationsDir, "missing")),
      ).toThrow("Migrations directory does not exist");
    });
  });

  describe("getSingleMigrationFile", () => {
    it("returns the file and metadata for the requested version", () => {
      writeMigration(secondVersion, "create_users");
      writeMigration(thirdVersion, "create_posts");

      expect(getSingleMigrationFile(migrationsDir, secondVersion)).toEqual({
        version: secondVersion,
        name: "20240101000002_create_users.sql",
        path: path.join(migrationsDir, "20240101000002_create_users.sql"),
      });
    });

    it("requires a regular SQL file whose name starts with the exact version and underscore", () => {
      writeFileSync(
        path.join(migrationsDir, "20240101000002-without-underscore.sql"),
        "",
      );
      writeFileSync(path.join(migrationsDir, "20240101000002_notes.txt"), "");
      mkdirSync(path.join(migrationsDir, "20240101000002_directory.sql"));

      expect(() => getSingleMigrationFile(migrationsDir, secondVersion)).toThrow(
        `Migration file for version "${secondVersion}" was not found in directory "${migrationsDir}".`,
      );
    });

    it("throws when no file exists for the requested version", () => {
      writeMigration(firstVersion, "first");

      expect(() => getSingleMigrationFile(migrationsDir, secondVersion)).toThrow(
        `Migration file for version "${secondVersion}" was not found in directory "${migrationsDir}".`,
      );
    });

    it("throws when the migrations directory does not exist", () => {
      expect(() =>
        getSingleMigrationFile(path.join(migrationsDir, "missing"), firstVersion),
      ).toThrow("Migrations directory does not exist");
    });
  });

  function writeMigration(version: bigint, name: string) {
    writeFileSync(path.join(migrationsDir, `${version}_${name}.sql`), "");
  }
});

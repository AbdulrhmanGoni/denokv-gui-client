import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { migrateDown, migrateUp } from "../index";

const migrationsDir = path.join(import.meta.dirname, "data", "for-migration-test");

const versions = [
  "20250101000001",
  "20250102000002",
  "20250103000003",
  "20250104000004",
  "20250105000005",
];

describe("migrateDown", () => {
  let database: DatabaseSync;
  let databasePath: string;

  beforeEach(() => {
    databasePath = `file:migrate-down-${crypto.randomUUID()}?mode=memory&cache=shared`;
    database = new DatabaseSync(databasePath);
    vi.spyOn(console, "log").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    database.close();
  });

  it("rolls back the latest applied migration and removes only its version", async () => {
    await migrateUp(databasePath, migrationsDir);

    await migrateDown(databasePath, migrationsDir);

    expect(appliedVersions()).toEqual(versions.slice(0, -1));
    expect(columnsFor("tasks")).toEqual(["id", "project_id", "title"]);
    expect(tableNames()).toEqual(["labels", "projects", "schema_migrations", "tasks"]);
  });

  it("rolls back one migration at a time in reverse version order", async () => {
    await migrateUp(databasePath, migrationsDir);

    await migrateDown(databasePath, migrationsDir);
    await migrateDown(databasePath, migrationsDir);

    expect(appliedVersions()).toEqual(versions.slice(0, 3));
    expect(tableNames()).toEqual(["projects", "schema_migrations", "tasks"]);
    expect(columnsFor("projects")).toEqual(["id", "name", "status"]);
  });

  it("does nothing when no migration version is recorded", async () => {
    database.exec("CREATE TABLE schema_migrations (version VARCHAR(128) PRIMARY KEY)");

    await migrateDown(databasePath, migrationsDir);

    expect(appliedVersions()).toEqual([]);
    expect(tableNames()).toEqual(["schema_migrations"]);
    expect(console.log).toHaveBeenCalledWith(
      "No applied migrations found in the database, Nothing to rollback!",
    );
  });

  function appliedVersions() {
    return database
      .prepare("SELECT version FROM schema_migrations ORDER BY version")
      .all()
      .map((row) => String(row.version));
  }

  function tableNames() {
    return database
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
      .all()
      .map((row) => String(row.name));
  }

  function columnsFor(table: string) {
    return database
      .prepare(`SELECT name FROM pragma_table_info('${table}') ORDER BY cid`)
      .all()
      .map((row) => String(row.name));
  }
});

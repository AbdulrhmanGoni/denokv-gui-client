import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { migrateUp } from "../index";

const migrationsDir = path.join(import.meta.dirname, "data", "for-migration-test");

const versions = [
  "20250101000001",
  "20250102000002",
  "20250103000003",
  "20250104000004",
  "20250105000005",
];

describe("migrateUp", () => {
  let database: DatabaseSync;
  let databasePath: string;

  beforeEach(() => {
    databasePath = `file:migrate-up-${crypto.randomUUID()}?mode=memory&cache=shared`;
    database = new DatabaseSync(databasePath);
    vi.spyOn(console, "log").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    database.close();
  });

  it("applies every migration when none has been recorded", async () => {
    await migrateUp(databasePath, migrationsDir);

    expect(console.log).toHaveBeenCalledWith(
      `${versions.length} pending migrations available:\n`,
    );
    expect(getAppliedVersions()).toEqual(versions);
    expect(tableNames()).toEqual(["labels", "projects", "schema_migrations", "tasks"]);
    expect(columnsFor("projects")).toEqual(["id", "name", "status"]);
    expect(columnsFor("tasks")).toEqual(["id", "project_id", "title", "priority"]);
  });

  it("applies only the two migrations that have not yet been recorded", async () => {
    createSchemaThroughThirdMigration();
    recordAppliedVersions(versions.slice(0, 3));

    await migrateUp(databasePath, migrationsDir);

    expect(getAppliedVersions()).toEqual(versions);
    expect(tableNames()).toEqual(["labels", "projects", "schema_migrations", "tasks"]);
    expect(columnsFor("tasks")).toEqual(["id", "project_id", "title", "priority"]);
    expect(console.log).toHaveBeenCalledWith("2 pending migrations available:\n");
  });

  it("applies only the one migration that has not yet been recorded", async () => {
    createSchemaThroughFourthMigration();
    recordAppliedVersions(versions.slice(0, 4));

    await migrateUp(databasePath, migrationsDir);

    expect(getAppliedVersions()).toEqual(versions);
    expect(columnsFor("tasks")).toEqual(["id", "project_id", "title", "priority"]);
    expect(console.log).toHaveBeenCalledWith("1 pending migration available:\n");
  });

  it("does not change the database when every migration has already been recorded", async () => {
    createFullyMigratedSchema();
    recordAppliedVersions(versions);

    await migrateUp(databasePath, migrationsDir);

    expect(getAppliedVersions()).toEqual(versions);
    expect(tableNames()).toEqual(["labels", "projects", "schema_migrations", "tasks"]);
    expect(console.log).toHaveBeenCalledWith("No pending migrations");
  });

  function recordAppliedVersions(appliedVersions: string[]) {
    const statement = database.prepare(
      "INSERT INTO schema_migrations (version) VALUES (?)",
    );
    for (const version of appliedVersions) statement.run(version);
  }

  function createSchemaThroughThirdMigration() {
    database.exec(`
      CREATE TABLE schema_migrations (version VARCHAR(128) PRIMARY KEY);
      CREATE TABLE projects (id INTEGER PRIMARY KEY, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active');
      CREATE TABLE tasks (
        id INTEGER PRIMARY KEY,
        project_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id)
      );
    `);
  }

  function createFullyMigratedSchema() {
    createSchemaThroughFourthMigration();
    database.exec("ALTER TABLE tasks ADD COLUMN priority INTEGER NOT NULL DEFAULT 0");
  }

  function createSchemaThroughFourthMigration() {
    createSchemaThroughThirdMigration();
    database.exec(`
      CREATE TABLE labels (id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE);
    `);
  }

  function getAppliedVersions() {
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

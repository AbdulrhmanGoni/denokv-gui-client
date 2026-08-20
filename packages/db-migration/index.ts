import { DatabaseSync } from "node:sqlite";
import { writeFileSync } from "fs";
import path from "path";
import {
  getLastAppliedMigration,
  getPendingMigrations,
  getSingleMigrationFile,
  parseMigrationFileContent,
} from "./helpers.ts";

function initDatabase(dbPath: string) {
  const database = new DatabaseSync(dbPath);
  try {
    database.exec(
      "CREATE TABLE IF NOT EXISTS schema_migrations (version VARCHAR(128) PRIMARY KEY)",
    );
  } catch (error) {
    database.close();
    throw error;
  }
  return database;
}

export async function migrateUp(dbPath: string, migrationsDir: string) {
  const database = initDatabase(dbPath);

  try {
    const pendingMigrations = getPendingMigrations(database, migrationsDir);
    if (!pendingMigrations.length) {
      console.log("No pending migrations");
      return;
    }

    console.log(
      `${pendingMigrations.length} pending migration${pendingMigrations.length > 1 ? "s" : ""} available:\n`,
    );

    for (let i = 0; i < pendingMigrations.length; i++) {
      const migrationFileContent = await parseMigrationFileContent(
        pendingMigrations[i].path,
      );

      const logPrefix = `[${i + 1}]`;
      console.log(logPrefix, `Applying ${pendingMigrations[i].name}...`);

      try {
        const insertVersionSql = `INSERT INTO schema_migrations (version) VALUES ('${pendingMigrations[i].version}')`;
        database.exec(
          `BEGIN TRANSACTION;\n${insertVersionSql};\n${migrationFileContent.upQuery};\nCOMMIT TRANSACTION;`,
        );
        console.log(" ".repeat(logPrefix.length), "applied ✅\n");
      } catch (error) {
        database.exec("ROLLBACK");
        database.close();
        console.log(" ".repeat(logPrefix.length), "Error ❌");
        throw error;
      }
    }
  } catch (error) {
    database.close();
    throw error;
  } finally {
    database.close();
  }
}

export async function migrateDown(dbPath: string, migrationsDir: string) {
  const database = initDatabase(dbPath);

  try {
    const lastAppliedMigrationVersion = getLastAppliedMigration(database);
    if (!lastAppliedMigrationVersion) {
      console.log("No applied migrations found in the database, Nothing to rollback!");
      return;
    }

    const lastAppliedMigrationFile = getSingleMigrationFile(
      migrationsDir,
      lastAppliedMigrationVersion,
    );

    const lastAppliedMigrationFileContent = await parseMigrationFileContent(
      lastAppliedMigrationFile.path,
    );

    console.log(`Rolling back ${lastAppliedMigrationFile.name}...`);

    try {
      const removeVersionQuery = `DELETE FROM schema_migrations WHERE version = '${lastAppliedMigrationVersion}'`;
      database.exec(
        `BEGIN TRANSACTION;\n${lastAppliedMigrationFileContent.downQuery};\n${removeVersionQuery};\nCOMMIT TRANSACTION;`,
      );
      console.log("Rolled back ✅\n");
    } catch (error) {
      database.exec("ROLLBACK");
      database.close();
      console.log("Error ❌");
      throw error;
    }
  } catch (error) {
    database.close();
    throw error;
  } finally {
    database.close();
  }
}

export function createNewMigration(name: string, migrationsDir: string) {
  const dateNow = new Date();

  const year = dateNow.getUTCFullYear();
  const month = String(dateNow.getUTCMonth() + 1).padStart(2, "0");
  const day = String(dateNow.getUTCDate()).padStart(2, "0");
  const hours = String(dateNow.getUTCHours()).padStart(2, "0");
  const minutes = String(dateNow.getUTCMinutes()).padStart(2, "0");
  const seconds = String(dateNow.getUTCSeconds()).padStart(2, "0");

  const fileName = `${year}${month}${day}${hours}${minutes}${seconds}_${name}.sql`;
  const filePath = path.join(migrationsDir, fileName);
  const content = "-- migrate:up\n\n-- migrate:down\n";
  writeFileSync(filePath, content);
  console.log(`Created new migration file: ${filePath}`);
}

export async function dumpSchema(dbPath: string, schemaFilePath: string) {
  const db = new DatabaseSync(dbPath);

  const selectSchemaQuery = db.prepare(
    `SELECT sql FROM sqlite_schema WHERE type = 'table' AND sql IS NOT NULL AND name NOT LIKE 'sqlite_%'`,
  );
  const separator = "\n\n";
  const allTableSchemas = selectSchemaQuery
    .all()
    .map((schema) => schema.sql + ";")
    .join(separator);

  const recordedMigrations = db.prepare(`SELECT version FROM schema_migrations`).all();
  const recordedVersions = recordedMigrations
    .map((migration) => `    ('${migration.version}')`)
    .join(",\n");

  const insertRecordedMigrationsQuery = recordedMigrations.length
    ? `INSERT INTO "schema_migrations" (version) VALUES\n${recordedVersions};`
    : "";

  writeFileSync(
    schemaFilePath,
    allTableSchemas + separator + insertRecordedMigrationsQuery,
  );

  console.log("Schema dumped successfully to", schemaFilePath);
  db.close();
}

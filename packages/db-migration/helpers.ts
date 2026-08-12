import { DatabaseSync } from "node:sqlite";
import { readdirSync, existsSync, Dirent } from "fs";
import path from "path";
import fs from "node:fs";
import readline from "node:readline";

type MigrationFile = {
  version: bigint;
  name: string;
  path: string;
};

export function getPendingMigrations(
  database: DatabaseSync,
  migrationsDir: string,
): MigrationFile[] {
  const exists = existsSync(migrationsDir);
  if (!exists) {
    throw new Error("Migrations directory does not exist");
  }

  const appliedMigrations = getAppliedMigrations(database);

  const dirEntries = readdirSync(migrationsDir, { withFileTypes: true });
  const pendingMigrationFiles = dirEntries.reduce<MigrationFile[]>(
    (pendingMigrations, entry) => {
      if (entry.isFile() && validateMigrationFileName(entry.name)) {
        const migrationFile = transformMigrationFileEntry(entry);
        if (!appliedMigrations.has(migrationFile.version)) {
          pendingMigrations.push(migrationFile);
        }
      }
      return pendingMigrations;
    },
    [],
  );

  return pendingMigrationFiles.sort((a, b) => Number(a.version - b.version));
}

function validateMigrationFileName(fileName: string): boolean {
  const [version] = fileName.split("_", 1);
  return (
    fileName.endsWith(".sql") &&
    version.length === 14 &&
    version.split("").every((ch) => !Number.isNaN(Number(ch)))
  );
}

export function getSingleMigrationFile(
  migrationsDir: string,
  migrationFileVersion: bigint,
): MigrationFile {
  const exists = existsSync(migrationsDir);
  if (!exists) {
    throw new Error("Migrations directory does not exist");
  }

  const entries = readdirSync(migrationsDir, { withFileTypes: true });
  const migrationFileEntry = entries.find(
    (entry) =>
      entry.isFile() &&
      entry.name.startsWith(migrationFileVersion + "_") &&
      entry.name.endsWith(".sql"),
  );

  if (!migrationFileEntry) {
    throw new Error(
      `Migration file for version "${migrationFileVersion}" was not found in directory "${migrationsDir}".`,
    );
  }

  return transformMigrationFileEntry(migrationFileEntry);
}

function transformMigrationFileEntry(file: Dirent<string>): MigrationFile {
  const [version] = file.name.split("_", 1);
  return {
    version: BigInt(version),
    name: file.name,
    path: path.join(file.parentPath, file.name),
  };
}

function getAppliedMigrations(db: DatabaseSync): Set<bigint> {
  const rows = db.prepare("SELECT version FROM schema_migrations").all();
  const appliedMigrations = new Set<bigint>();
  for (const row of rows) {
    appliedMigrations.add(BigInt(String(row.version)));
  }
  return appliedMigrations;
}

export function getLastAppliedMigration(db: DatabaseSync): bigint | null {
  const migrationRecord = db
    .prepare("SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1")
    .get();

  if (migrationRecord) {
    return BigInt(String(migrationRecord.version));
  }

  return null;
}

type ParsedMigrationFileContent = {
  upQuery: string;
  downQuery: string;
};

export async function parseMigrationFileContent(
  filePath: string,
): Promise<ParsedMigrationFileContent> {
  const fileStream = fs.createReadStream(filePath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let upQuery = "",
    downQuery = "",
    parsingUp = false,
    parsingDown = false;

  for await (const line of rl) {
    if (line.trim() === "-- migrate:up") {
      if (parsingUp || parsingDown) {
        throw new Error("multiple '-- migrate:up' blocks are not allowed");
      }

      parsingUp = true;
      parsingDown = false;
      continue;
    }

    if (line.trim() === "-- migrate:down") {
      if (parsingDown) {
        throw new Error("multiple '-- migrate:down' blocks are not allowed");
      }

      if (!parsingUp) {
        throw new Error(
          "No '-- migrate:up' block found before the first '-- migrate:down' block",
        );
      }

      if (!upQuery.trim()) {
        throw new Error("the '-- migrate:up' block should not be empty");
      }

      parsingUp = false;
      parsingDown = true;
      continue;
    }

    if (parsingUp) {
      upQuery += upQuery ? "\n" + line : line;
      continue;
    }

    if (parsingDown) {
      downQuery += downQuery ? "\n" + line : line;
    }
  }

  if (!upQuery.trim()) {
    throw new Error("the '-- migrate:up' block should not be empty");
  }

  if (!downQuery.trim()) {
    throw new Error("the '-- migrate:down' block should not be empty");
  }

  return {
    upQuery,
    downQuery,
  };
}

import { DatabaseSync } from "node:sqlite";
import { getDatabasePath } from "./dbPath.js";
import { migrateUp } from "@app/db-migration";
import path from "path";

const dbPath = getDatabasePath();

if (process.env.NODE_ENV !== "development") {
  await migrateUp(dbPath, path.join(import.meta.dirname, "migrations"));
}

export const database = new DatabaseSync(dbPath);

export function databaseTransaction<T>(fn: () => T) {
  database.exec("BEGIN");
  try {
    const result = fn();
    database.exec("COMMIT");
    return result;
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

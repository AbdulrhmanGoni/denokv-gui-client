#!/usr/bin/env node

import { createNewMigration, migrateDown, migrateUp } from "./index.ts";

const dbPath = "./database.dev.sqlite";
const migrationsDir = "./packages/main/src/db/migrations";

const command = process.argv[2];
if (!command) {
  throw new Error("No command was passed! Available commands: up, down, new");
}

switch (command) {
  case "up": {
    await migrateUp(dbPath, migrationsDir);
    break;
  }

  case "down": {
    await migrateDown(dbPath, migrationsDir);
    break;
  }

  case "new": {
    const newMigrationFileName = process.argv[3];
    if (!newMigrationFileName) {
      throw new Error("Please provide a name for the migration!");
    }

    createNewMigration(newMigrationFileName, migrationsDir);
    break;
  }

  default: {
    throw new Error(`Unknown command "${command}"!`);
  }
}

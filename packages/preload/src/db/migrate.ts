import { execSync } from 'node:child_process';
import { resolveBinary } from 'dbmate';
import path from 'node:path';

export function migrateDatabaseSchema(dbPath: string) {
    const dbmateBinaryPath = resolveBinary().replace("app.asar", "app.asar.unpacked")
    const migrationsDir = path.join(process.resourcesPath, "app.asar.unpacked/node_modules/@app/preload/dist/migrations")
    execSync(`"${dbmateBinaryPath}" -u "sqlite:${dbPath}" -d "${migrationsDir}" --no-dump-schema migrate`)
}
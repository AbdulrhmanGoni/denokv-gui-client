import { writeFile, unlink } from 'node:fs/promises';
import { deleteOneQuery, getAllQuery, insertQuery, updateQuery } from './db/kvStoresQueries.js';
import path from 'node:path';

export async function create(input: CreateKvStoreInput): Promise<boolean> {
    if (input.type == "local") {
        input.url = path.join(input.url, "kv.sqlite3")
        await writeFile(input.url, "");
    }

    const result = insertQuery.run(
        crypto.randomUUID(),
        input.name,
        input.url,
        input.type,
        input.accessToken ?? null
    );

    return result.changes === 1
}

export function update(id: number, input: EditKvStoreInput): boolean {
    updateQuery.run({
        $id: id,
        $name: input.name ?? null,
        $url: input.url ?? null,
    });

    return true
}

export async function getAll() {
    return getAllQuery.all() as KvStore[]
}

export async function deleteOne(kvStore: KvStore) {
    if (kvStore.type == "default" || kvStore.type == "local") {
        await unlink(kvStore.url)
        if (kvStore.type == "default") return true;
    }

    const result = deleteOneQuery.run(kvStore.id)
    return !!result.changes
}

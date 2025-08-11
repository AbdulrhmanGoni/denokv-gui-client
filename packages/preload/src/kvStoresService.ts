import { readdir, writeFile, unlink } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import { exec } from 'node:child_process';
import { deleteOneQuery, getAllQuery, insertQuery, updateQuery } from './db/kvStoresQueries.js';
import path from 'node:path';
import { openKv } from '@deno/kv';
import { deadline } from '@std/async';

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
        input.accessToken
    );

    return result.changes === 1
}

export function update(id: string, input: EditKvStoreInput): boolean {
    updateQuery.run({
        $id: id,
        $name: input.name ?? null,
        $url: input.url ?? null,
        $type: input.type ?? null,
        $accessToken: input.accessToken,
    });

    return true
}

export async function getAll() {
    return [...getAllQuery.all(), ...(await getDefaultLocalKvStores())] as KvStore[]
}

export async function deleteOne(kvStore: KvStore) {
    if (kvStore.type == "default" || kvStore.type == "local") {
        await unlink(kvStore.url)
        if (kvStore.type == "default") return true;
    }

    const result = deleteOneQuery.run(kvStore.id)
    return !!result.changes
}

async function getDefaultLocalKvStores() {
    return new Promise<KvStore[]>((resolve) => {
        exec('deno info --json', async (err, infoResult) => {
            if (err) resolve([])
            const localDenoKvsLocaltion = JSON.parse(infoResult).originStorage
            if (localDenoKvsLocaltion) {
                const dataDirs: KvStore[] = [];
                const dir = await readdir(localDenoKvsLocaltion, { withFileTypes: true })
                for (const entry of dir) {
                    if (entry.isDirectory()) {
                        const kvFile = `${entry.parentPath}/${entry.name}/kv.sqlite3`;
                        if (existsSync(kvFile)) {
                            const fileStat = statSync(kvFile)
                            dataDirs.push({
                                id: entry.name,
                                name: entry.name.slice(0, 15),
                                url: kvFile,
                                type: "default",
                                createdAt: fileStat.ctime.toISOString(),
                                updatedAt: fileStat.birthtime.toISOString(),
                                accessToken: null,
                            })
                        }
                    }
                }
                resolve(dataDirs)
            } else {
                resolve([])
            }
        })
    })
}

export async function testKvStoreConnection(kvStore: TestKvStoreParams): Promise<boolean> {
    if (kvStore.type == "bridge") {
        return await fetch(`${kvStore.url}/check`)
            .then((res) => res.ok)
            .catch(() => false)
    } else {
        const kv = await openKv(kvStore.url, { accessToken: kvStore.accessToken });
        // Trying to get a random entry to make sure the KV Store exists
        return await deadline(kv.get([crypto.randomUUID()]), 6000) // Reject after 6s because remote KVs might hang forever
            .then(() => true)
            .catch(() => false)
    }
}
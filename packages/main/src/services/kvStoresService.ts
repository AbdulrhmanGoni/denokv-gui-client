import { readdir, writeFile, rm, rename, mkdir } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import { exec } from 'node:child_process';
import { deleteOneQuery, getAllQuery, getOneQuery, insertQuery, updateQuery } from '../db/kvStoresQueries.js';
import path from 'node:path';
import { openKv } from '@deno/kv';
import { deadline } from '@std/async';
import { clearSavedParamsQuery } from '../db/browsingParamsQueries.js';

export async function create(input: CreateKvStoreInput): Promise<boolean> {
    if (input.type == "local" && (input.replaceExisting || !existsSync(input.url))) {
        await writeFile(input.url, "");
    }

    const result = insertQuery.run(
        crypto.randomUUID(),
        input.name,
        input.url,
        input.type,
        input.accessToken,
        input.authToken,
    );

    return !!result.changes
}

export async function update(kvStore: KvStore, changes: EditKvStoreInput): Promise<boolean> {
    if (kvStore.type == "local" && changes.url && !changes.type) {
        await relocateLocalKvStore(kvStore, changes.url)
    }

    if (changes.type == "local" && changes.url) {
        const dir = path.dirname(changes.url)
        if (!existsSync(dir)) {
            await mkdir(dir, { recursive: true })
        }

        if (!existsSync(changes.url)) {
            await writeFile(changes.url, "");
        }
    }

    updateQuery.run({
        $id: kvStore.id,
        $name: changes.name ?? null,
        $url: changes.url ?? null,
        $type: changes.type ?? null,
        $accessToken: changes.accessToken,
        $authToken: changes.authToken,
    });

    return true
}

export async function getAll() {
    const kvStores = getAllQuery.all() as KvStore[];
    const defaultKvStores = await getDefaultLocalKvStores(
        kvStores.filter((store) => store.type == "default").map((s) => s.id)
    );

    return [...kvStores, ...defaultKvStores]
        .sort((storeA, storeB) =>
            new Date(storeB.updatedAt).getTime() - new Date(storeA.updatedAt).getTime()
        );
}

export async function deleteOne(kvStore: KvStore) {
    if (kvStore.type == "default" || kvStore.type == "local") {
        await rm(kvStore.url, { force: true })
        await rm(`${kvStore.url}-shm`, { force: true });
        await rm(`${kvStore.url}-wal`, { force: true });

        if (kvStore.type == "default") {
            const storedKvStore = getOneQuery.get(kvStore.id) as KvStore | undefined
            if (!storedKvStore) {
                clearSavedParamsQuery.run(kvStore.id)
                return true
            }
        }
    }

    const result = deleteOneQuery.run(kvStore.id)

    if (result.changes) {
        clearSavedParamsQuery.run(kvStore.id)
    }

    return result.changes
}

async function getDefaultLocalKvStores(exclude: KvStore["id"][]) {
    return new Promise<KvStore[]>((resolve) => {
        exec('deno info --json', async (err, infoResult) => {
            if (err) return resolve([])
            const localDenoKvsLocaltion = JSON.parse(infoResult).originStorage
            if (localDenoKvsLocaltion && existsSync(localDenoKvsLocaltion)) {
                const dataDirs: KvStore[] = [];
                const dir = await readdir(localDenoKvsLocaltion, { withFileTypes: true })
                for (const entry of dir) {
                    if (entry.isDirectory() && !exclude.includes(entry.name)) {
                        const kvFile = path.join(entry.parentPath, entry.name, "kv.sqlite3");
                        if (existsSync(kvFile)) {
                            const fileStat = statSync(kvFile)
                            dataDirs.push({
                                id: entry.name,
                                name: entry.name.slice(0, 15),
                                url: kvFile,
                                type: "default",
                                createdAt: fileStat.birthtime.toISOString(),
                                updatedAt: fileStat.ctime.toISOString(),
                                accessToken: null,
                                authToken: null,
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

export async function renameDefaultLocalKvStore(store: KvStore, newName: string): Promise<boolean> {
    if (store.type != "default") {
        return false
    }

    const storedKvStore = getOneQuery.get(store.id) as KvStore | undefined
    if (storedKvStore) {
        const result = updateQuery.run({
            $id: storedKvStore.id,
            $name: newName,
        });

        return !!result.changes
    } else {
        const result = insertQuery.run(
            store.id,
            newName,
            store.url,
            store.type,
            null
        );

        return !!result.changes
    }
}

export async function testKvStoreConnection(kvStore: TestKvStoreParams): Promise<boolean> {
    if (kvStore.type == "bridge") {
        return await fetch(
            `${kvStore.url}/check`,
            { headers: kvStore.authToken ? { Authorization: kvStore.authToken } : undefined },
        ).then((res) => res.ok).catch(() => false)
    } else {
        try {
            const kv = await openKv(kvStore.url, { accessToken: kvStore.accessToken });
            // Trying to get a random entry to make sure the KV Store exists
            return await deadline(kv.get([crypto.randomUUID()]), 6000) // Reject after 6s because remote KVs might hang forever
                .then(() => true)
                .catch(() => false)
                .finally(() => kv.close())
        } catch {
            return false
        }
    }
}

async function relocateLocalKvStore(kvStore: KvStore, newFilePath: string) {
    const newDir = path.dirname(newFilePath)
    await mkdir(newDir, { recursive: true })

    await rename(kvStore.url, newFilePath)

    const oldDir = path.dirname(kvStore.url)
    const oldFileName = path.basename(kvStore.url)
    await Promise.all([
        rename(path.join(oldDir, `${oldFileName}-wal`), path.join(newDir, `${path.basename(newFilePath)}-wal`)),
        rename(path.join(oldDir, `${oldFileName}-shm`), path.join(newDir, `${path.basename(newFilePath)}-shm`))
    ]).catch(() => null)
}

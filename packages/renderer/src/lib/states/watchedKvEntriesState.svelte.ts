import { isSameKvKey } from "@app/bridge-server/kv-utils";
import { kvClient, watchedKeysService } from "@app/preload";
import { kvEntriesState } from "./kvEntriesState.svelte";
import { kvEntryDialogState } from "./kvEntryDialogState.svelte";
import { kvStoresState } from "./kvStoresState.svelte";
import { toast } from "svelte-sonner";

type WatchedKvEntriesState = {
    keys: SerializedKvKey[];
    keysEntries: SerializedKvEntry[]
    justUpdatedEntries: {
        id: number;
        entries: SerializedKvEntry[]
    }[];
    openDialog: boolean;
    selectedKeys: SerializedKvKey[];
}

export const watchedKvEntriesState: WatchedKvEntriesState = $state({
    openDialog: false,
    keys: [],
    keysEntries: [],
    justUpdatedEntries: [],
    selectedKeys: [],
});

export async function fetchWatchedKeysForOpenedKvStore() {
    if (!kvStoresState.openedStore) return
    const watchedEntriesKeys = await watchedKeysService.getWatchedKeys(kvStoresState.openedStore.id)
    watchedKvEntriesState.keys = watchedEntriesKeys || []
}

export function resetWatchedKvEntriesState() {
    watchedKvEntriesState.openDialog = false
    watchedKvEntriesState.keys = []
    watchedKvEntriesState.keysEntries = []
    watchedKvEntriesState.justUpdatedEntries = []
    watchedKvEntriesState.selectedKeys = []
}

export function startWatchingKvEntries(isReopen: boolean = false) {
    if (!watchedKvEntriesState.keys.length) {
        kvClient.cancelWatcher()
        return
    }

    kvClient.watch($state.snapshot(watchedKvEntriesState.keys), (updatedEntries) => {
        const isInitialCall = !watchedKvEntriesState.keysEntries.length
        if (updatedEntries.length === watchedKvEntriesState.keys.length) {
            watchedKvEntriesState.keysEntries = updatedEntries
        } else {
            watchedKvEntriesState.keysEntries = watchedKvEntriesState.keysEntries.map((entry) => (
                updatedEntries.find((ue) => isSameKvKey(entry.key, ue.key)) ?? entry
            ))
        }

        kvEntriesState.entries = kvEntriesState.entries.map((entry) => {
            const updatedEntry = updatedEntries.find((ue) => isSameKvKey(entry.key, ue.key))
            return updatedEntry ? updatedEntry : entry
        })

        if (kvEntryDialogState.entry && kvEntryDialogState.open) {
            const updatedEntry = updatedEntries.find((ue) => isSameKvKey(kvEntryDialogState.entry!.key, ue.key))
            if (updatedEntry) kvEntryDialogState.entry = updatedEntry
        }

        if (!isInitialCall && !isReopen) {
            const updateId = Date.now()
            watchedKvEntriesState.justUpdatedEntries.push({
                id: updateId,
                entries: updatedEntries
            })

            setTimeout(() => {
                watchedKvEntriesState.justUpdatedEntries =
                    watchedKvEntriesState.justUpdatedEntries.filter((entry) => entry.id !== updateId)
            }, 1000)
        }

        if (isReopen) isReopen = false
    })
}

export async function syncWatchedKeys(updatedWatchedKeys: SerializedKvKey[]) {
    if (kvStoresState.openedStore) {
        const success = await watchedKeysService.setWatchedKeys(
            kvStoresState.openedStore.id,
            $state.snapshot(updatedWatchedKeys),
        )
        if (success) {
            await fetchWatchedKeysForOpenedKvStore()
            watchedKvEntriesState.keysEntries = watchedKvEntriesState.keysEntries.filter(
                (entry) => updatedWatchedKeys.some((key) => isSameKvKey(entry.key, key))
            )
            watchedKvEntriesState.selectedKeys = watchedKvEntriesState.selectedKeys.filter(
                (key) => updatedWatchedKeys.some((k) => isSameKvKey(key, k))
            )
            startWatchingKvEntries(true)
        } else toast.error("Failed to sync watched keys.")
    }
}

export async function watchKvEntries(entries: SerializedKvEntry[]) {
    if (!kvStoresState.openedStore) return

    const updatedWatchedKeys: SerializedKvKey[] = [...watchedKvEntriesState.keys]

    for (const entry of entries) {
        const exists = watchedKvEntriesState.keys.some((key) => isSameKvKey(key, entry.key))
        !exists && updatedWatchedKeys.push(entry.key)
    }

    if (watchedKvEntriesState.keys.length === updatedWatchedKeys.length) return
    await syncWatchedKeys(updatedWatchedKeys)
}

export async function unwatchKvEntries(entries: SerializedKvEntry[]) {
    const updatedWatchedKeys: SerializedKvKey[] = watchedKvEntriesState.keys.filter(
        (key) => !entries.some((e) => isSameKvKey(key, e.key))
    )
    if (watchedKvEntriesState.keys.length === updatedWatchedKeys.length) return
    await syncWatchedKeys(updatedWatchedKeys)
}

export function isWatchedEntry(entry: SerializedKvEntry): boolean {
    return watchedKvEntriesState.keys.some((key) => isSameKvKey(key, entry.key))
}

export function isUpdatedRecently(entry: SerializedKvEntry): "edited" | "deleted" | null {
    let updatedEntry: SerializedKvEntry | undefined = undefined;
    for (const update of watchedKvEntriesState.justUpdatedEntries) {
        updatedEntry = update.entries.find((e) => isSameKvKey(e.key, entry.key))
        if (updatedEntry) break
    }

    if (updatedEntry) {
        return updatedEntry.versionstamp === null ? "deleted" : "edited"
    }

    return null
}

export function isSelectedKey(key: SerializedKvKey) {
    return watchedKvEntriesState.selectedKeys.some((k) => isSameKvKey(k, key))
}

export function toggleSelectedKey(key: SerializedKvKey, isSelected?: boolean) {
    if (isSelected ?? isSelectedKey(key)) {
        watchedKvEntriesState.selectedKeys = watchedKvEntriesState.selectedKeys.filter((k) => !isSameKvKey(k, key))
    } else {
        watchedKvEntriesState.selectedKeys.push(key)
    }
}

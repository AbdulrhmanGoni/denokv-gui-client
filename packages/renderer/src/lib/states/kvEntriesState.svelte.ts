import { kvClient } from "@app/preload";
import { kvStoresState } from "./kvStoresState.svelte";
import { columns } from "$lib/components/Browser/columns";
import { createSvelteTable } from "$lib/components/shadcn/data-table";
import { getCoreRowModel, type RowSelectionState } from "@tanstack/table-core";

type KvEntriesState = {
    entries: KvEntry[];
    params: BrowsingParams;
    loading: boolean;
    fetched: boolean;
    error: string;
}

export const kvEntriesStateDefaultValues: KvEntriesState = {
    entries: [],
    params: {
        limit: 40,
        prefix: "[]",
        start: "[]",
        end: "[]",
        cursors: [],
        nextCursorIndex: -1,
    },
    loading: false,
    fetched: false,
    error: "",
}

export const kvEntriesState: KvEntriesState = $state(kvEntriesStateDefaultValues);

export async function fetchEntries() {
    if (kvStoresState.openedStore) {
        kvEntriesState.loading = true;
        const { error, result, cursor } = await kvClient.browse($state.snapshot(kvEntriesState.params));
        if (error) {
            kvEntriesState.error = error;
            kvEntriesState.entries = [];
            kvEntriesState.fetched = false;
        } else {
            kvEntriesState.error = "";
            kvEntriesState.entries = result ? result : [];
            kvEntriesState.fetched = true;

            if (cursor) {
                const nextCursorIndex = kvEntriesState.params.cursors.indexOf(cursor)
                if (nextCursorIndex == -1) {
                    kvEntriesState.params.cursors.push(cursor)
                    kvEntriesState.params.nextCursorIndex++
                } else {
                    kvEntriesState.params.nextCursorIndex = nextCursorIndex
                }
            } else {
                kvEntriesState.params.nextCursorIndex++
            }
        }
        kvEntriesState.loading = false;
    }
}

export function removeEntryFromState(entry: KvEntry) {
    kvEntriesState.entries = kvEntriesState.entries.filter((ent) => (
        !ent.key.every((part, i) => {
            if (typeof part === "object" && typeof entry.key[i] === "object") {
                return part.type == entry.key[i].type && part.value == entry.key[i].value
            }
            return entry.key[i] === part
        })
    ))
}

export function resetEntriesState() {
    Object.assign(kvEntriesState, kvEntriesStateDefaultValues)
}

export function resetBrowsingParamsState() {
    kvEntriesState.params = kvEntriesStateDefaultValues.params
}

export function createKvEntriesTable() {
    let rowSelection = $state<RowSelectionState>({});

    return createSvelteTable({
        get data() {
            return kvEntriesState.entries;
        },
        getRowId: (row) => JSON.stringify(row.key),
        columns,
        getCoreRowModel: getCoreRowModel(),
        onRowSelectionChange: (updater) => {
            if (typeof updater === "function") {
                rowSelection = updater(rowSelection);
            } else {
                rowSelection = updater;
            }
        },
        state: {
            get rowSelection() {
                return rowSelection;
            },
        },
    });
}

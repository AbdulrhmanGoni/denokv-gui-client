import { kvClient, browsingParamsService } from "@app/preload";
import { kvStoresState } from "./kvStoresState.svelte";
import { columns } from "$lib/components/Browser/columns";
import { createSvelteTable } from "$lib/components/shadcn/data-table";
import { getCoreRowModel, type RowSelectionState } from "@tanstack/table-core";

type KvEntriesState = {
    entries: KvEntry[];
    params: BrowsingParams & {
        nextCursorIndex: number;
        cursors: NonNullable<BrowseRouteOptions["cursor"]>[];
    };
    loading: boolean;
    fetched: boolean;
    error: string;
    noMoreEntries: boolean;
}

const defaultBrowsingParams = {
    prefix: "[]",
    start: "[]",
    end: "[]",
    limit: 40,
}

export const kvEntriesStateDefaultValues: KvEntriesState = {
    entries: [],
    params: {
        ...defaultBrowsingParams,
        cursors: [],
        nextCursorIndex: -1,
    },
    loading: false,
    fetched: false,
    error: "",
    noMoreEntries: false,
}

export const kvEntriesState: KvEntriesState = $state(kvEntriesStateDefaultValues);

export async function fetchEntries() {
    if (kvStoresState.openedStore) {
        kvEntriesState.loading = true;
        const { error, result } = await kvClient.browse(
            $state.snapshot(kvEntriesState.params),
            kvEntriesState.params.cursors[kvEntriesState.params.nextCursorIndex]
        );

        if (error) {
            kvEntriesState.error = error;
            kvEntriesState.entries = [];
            kvEntriesState.fetched = false;
        } else {
            kvEntriesState.error = "";
            kvEntriesState.entries = result?.entries ? result?.entries : [];
            kvEntriesState.fetched = true;

            if (result?.cursor) {
                const nextCursorIndex = kvEntriesState.params.cursors.indexOf(result?.cursor)
                if (nextCursorIndex == -1) {
                    kvEntriesState.params.cursors.push(result?.cursor)
                    kvEntriesState.params.nextCursorIndex++
                } else {
                    kvEntriesState.params.nextCursorIndex = nextCursorIndex
                }
            } else {
                kvEntriesState.params.nextCursorIndex++
            }

            if (kvEntriesState.entries.length < kvEntriesState.params.limit) {
                kvEntriesState.noMoreEntries = true
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
    fetchSavedDefaultBrowsingParams()
    Object.assign(kvEntriesState, kvEntriesStateDefaultValues)
}

export function resetBrowsingParamsState() {
    fetchSavedDefaultBrowsingParams()
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

export function setBrowsingParams(params: BrowsingParams) {
    kvEntriesState.params = {
        ...kvEntriesStateDefaultValues.params,
        ...params,
    };
    kvEntriesState.noMoreEntries = false;
    fetchEntries();
}

type SavedBrowsingParamsState = {
    savedParams: SavedBrowsingParamsRecord<BrowsingParams>[];
    fetched: boolean;
    error: string;
    selectedParamsToEdit: SavedBrowsingParamsRecord<BrowsingParams> | null;
}

export const savedBrowsingParamsState: SavedBrowsingParamsState = $state({
    savedParams: [],
    fetched: false,
    error: "",
    selectedParamsToEdit: null,
});

export function fetchSavedBrowsingParams() {
    if (kvStoresState.openedStore) {
        const { result, error } =
            browsingParamsService.getSavedBrowsingParamsRecords(
                kvStoresState.openedStore.id,
            );

        if (result) {
            savedBrowsingParamsState.savedParams = result;
            savedBrowsingParamsState.error = "";
            savedBrowsingParamsState.fetched = true;
        } else {
            savedBrowsingParamsState.error = error;
            savedBrowsingParamsState.fetched = false;
        }
    }
}

export function fetchSavedDefaultBrowsingParams() {
    if (kvStoresState.openedStore) {
        const { result } = browsingParamsService.getDefaultSavedBrowsingParams(
            kvStoresState.openedStore.id
        )

        kvEntriesStateDefaultValues.params = {
            ...kvEntriesStateDefaultValues.params,
            ...(result?.paramsAsJson || defaultBrowsingParams)
        }
    }
}

export function setDefaultBrowsingParams(params?: BrowsingParams) {
    Object.assign(kvEntriesStateDefaultValues.params, params ?? defaultBrowsingParams)
}
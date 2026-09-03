import { browsingParamsService } from "@app/preload";
import { getOpenedKvStoreClient, kvStoresState } from "./kvStoresState.svelte";
import { columns } from "$lib/features/kv-browser/table/columns";
import { createSvelteTable } from "$lib/ui/shadcn/data-table";
import { getCoreRowModel, type RowSelectionState } from "@tanstack/table-core";
import { isSameKvKey } from "@app/bridge-server/kv-utils";
import { toast } from "svelte-sonner";
import type { BrowsingOptions, SerializedKvEntry } from "@app/bridge-server";
import type { BrowsingParams, SavedBrowsingParamsRecord } from "@app/main";

type KvEntriesState = {
  entries: SerializedKvEntry[];
  params: BrowsingParams & {
    cursors: NonNullable<BrowsingOptions["cursor"]>[];
  };
  loading: boolean;
  fetched: boolean;
  error: string;
  noMoreEntries: boolean;
};

const defaultBrowsingParams = {
  prefix: "[]",
  start: "[]",
  end: "[]",
  limit: 40,
  batchSize: 40,
  reverse: false,
  consistency: "strong",
};

export const kvEntriesStateDefaultValues: KvEntriesState = {
  entries: [],
  params: {
    ...defaultBrowsingParams,
    cursors: [],
  },
  loading: false,
  fetched: false,
  error: "",
  noMoreEntries: false,
};

export const kvEntriesState: KvEntriesState = $state(kvEntriesStateDefaultValues);

export async function fetchEntries() {
  const client = await getOpenedKvStoreClient();

  kvEntriesState.loading = true;

  const options: BrowsingOptions = {
    limit: kvEntriesState.params.limit,
    batchSize: kvEntriesState.params.batchSize,
    reverse: kvEntriesState.params.reverse,
    consistency: kvEntriesState.params.consistency,
    xssSafe: false,
    jsKey: true,
  };

  const nextCursor = kvEntriesState.params.cursors.at(-1);
  if (nextCursor) {
    options.cursor = nextCursor;
  }

  for (const param of ["prefix", "start", "end"] as const) {
    if (kvEntriesState.params[param] === "[]") continue;

    const evaluatedKey = (0, eval)(`(${kvEntriesState.params[param]})`);
    const isArray = Array.isArray(evaluatedKey);
    if (isArray) {
      if (evaluatedKey.length) options[param] = kvEntriesState.params[param];
    } else {
      return {
        error: `Invalid ${param} Key, Must be an array containing valid Deno Kv Key-parts`,
        result: null,
      };
    }
  }

  const { error, result } = await client.browse(options);

  if (error) {
    kvEntriesState.error = error;
    kvEntriesState.entries = [];
    kvEntriesState.fetched = false;
  } else {
    kvEntriesState.error = "";
    kvEntriesState.entries = result?.entries ? result?.entries : [];
    kvEntriesState.fetched = true;

    if (result?.cursor) {
      if (kvEntriesState.params.cursors.at(-1) !== result.cursor) {
        kvEntriesState.params.cursors.push(result.cursor);
      }
    } else {
      kvEntriesState.noMoreEntries = true;
    }

    if (kvEntriesState.entries.length < kvEntriesState.params.limit) {
      kvEntriesState.noMoreEntries = true;
    }
  }
  kvEntriesState.loading = false;
}

export function removeEntryFromState(entry: SerializedKvEntry) {
  kvEntriesState.entries = kvEntriesState.entries.filter(
    (ent) => !isSameKvKey(entry.key, ent.key),
  );
}

export function removeEntriesFromState(entries: SerializedKvEntry[]) {
  kvEntriesState.entries = kvEntriesState.entries.filter((ent) => {
    for (const entry of entries) {
      if (isSameKvKey(entry.key, ent.key)) return false;
    }

    return true;
  });
}

export async function resetEntriesState() {
  await fetchSavedDefaultBrowsingParams();
  Object.assign(kvEntriesState, kvEntriesStateDefaultValues);
}

export async function resetBrowsingParamsState() {
  await fetchSavedDefaultBrowsingParams();
  kvEntriesState.params = kvEntriesStateDefaultValues.params;
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
};

export const savedBrowsingParamsState: SavedBrowsingParamsState = $state({
  savedParams: [],
  fetched: false,
  error: "",
  selectedParamsToEdit: null,
});

export async function fetchSavedBrowsingParams() {
  if (kvStoresState.openedStore) {
    const { result, error } = await browsingParamsService.getSavedBrowsingParamsRecords(
      kvStoresState.openedStore.id,
    );

    if (result) {
      savedBrowsingParamsState.savedParams = result;
      savedBrowsingParamsState.error = "";
      savedBrowsingParamsState.fetched = true;
    } else {
      savedBrowsingParamsState.error = error ?? "Failed to fetch saved browsing params";
      savedBrowsingParamsState.fetched = false;
    }
  }
}

export async function fetchSavedDefaultBrowsingParams() {
  if (kvStoresState.openedStore) {
    const { result, error } = await browsingParamsService.getDefaultSavedBrowsingParams(
      kvStoresState.openedStore.id,
    );

    if (error) return toast.error(error);

    kvEntriesStateDefaultValues.params = {
      ...kvEntriesStateDefaultValues.params,
      ...(result?.paramsAsJson || defaultBrowsingParams),
    };
  }
}

export function setDefaultBrowsingParams(params?: BrowsingParams) {
  Object.assign(kvEntriesStateDefaultValues.params, params ?? defaultBrowsingParams);
}

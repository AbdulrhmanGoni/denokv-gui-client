import { globalState } from "$lib/states/globalState.svelte";
import { bridgeServer, kvStoresService, metadata } from "@app/preload";
import { toast } from "svelte-sonner";
import {
  BridgeServerClient,
  type BridgeServerClientOptions,
} from "@app/bridge-server/client";
import type { KvStore } from "@app/main";

type StoresState = {
  kvStores: KvStore[];
  kvStoreTypeCounts: Record<KvStore["type"], number>;
  loaded: boolean;
  error: string;
  openedStore: KvStore | null;
  openedStoreClient: BridgeServerClient | null;
  openedStoreToEdit: KvStore | null;
  openAddNewStoreForm: boolean;
  renameDefaultKvStore: KvStore | null;
  selectedTypes: KvStore["type"][];
};

export let kvStoresState: StoresState = $state({
  kvStores: [],
  kvStoreTypeCounts: {
    remote: 0,
    local: 0,
    default: 0,
    bridge: 0,
  },
  loaded: false,
  error: "",
  openedStore: null,
  openedStoreClient: null,
  openedStoreToEdit: null,
  openAddNewStoreForm: false,
  renameDefaultKvStore: null,
  selectedTypes: [],
});

function calculateKvStoreTypeCounts() {
  kvStoresState.kvStoreTypeCounts = kvStoresState.kvStores.reduce(
    (counts, kvStore) => {
      counts[kvStore.type] += 1;
      return counts;
    },
    {
      remote: 0,
      local: 0,
      default: 0,
      bridge: 0,
    } satisfies Record<KvStore["type"], number>,
  );
}

export async function loadKvStores() {
  const { result, error } = await kvStoresService.getAll();
  if (error) {
    toast.error(error);
    kvStoresState.error = error;
    kvStoresState.loaded = false;
    return;
  }
  kvStoresState.kvStores = result ?? [];
  calculateKvStoreTypeCounts();
  kvStoresState.loaded = true;
  kvStoresState.error = "";
}

export async function openKvStore(kvStore: KvStore) {
  globalState.loadingOverlay.open = true;
  globalState.loadingOverlay.text = "Testing Kv Database Connection...";
  const { result: testSucceed, error } = await kvStoresService.testKvStoreConnection(
    $state.snapshot(kvStore),
  );
  globalState.loadingOverlay.open = false;
  globalState.loadingOverlay.text = "";

  if (error) {
    toast.error(error);
    return false;
  }

  if (testSucceed) {
    const kvStoreClient = await startKvStoreServer(kvStore);
    if (kvStoreClient) {
      kvStoresState.openedStore = kvStore;
      kvStoresState.openedStoreClient = kvStoreClient;
      return true;
    } else {
      return false;
    }
  }

  toast.error("Connection Test failed", {
    description: testKvStoreConnectionErrorMessages[kvStore.type],
  });
  return false;
}

export async function closeKvStore() {
  kvStoresState.openedStore = null;
  const { error } = await bridgeServer.closeServer();
  if (error) toast.error(error);
}

export function removeKvStore(kvStore: KvStore) {
  const filteredKvStores = kvStoresState.kvStores.filter((c) => c.id != kvStore.id);
  if (kvStoresState.kvStores.length === filteredKvStores.length) return;
  kvStoresState.kvStores = filteredKvStores;
  kvStoresState.kvStoreTypeCounts[kvStore.type] -= 1;
}

async function startKvStoreServer(kvStore: KvStore): Promise<BridgeServerClient | null> {
  globalState.loadingOverlay.open = true;
  globalState.loadingOverlay.text = "Starting the Kv bridge server...";
  const response = await bridgeServer.openServer($state.snapshot(kvStore));
  globalState.loadingOverlay.open = false;
  globalState.loadingOverlay.text = "";

  if (response.error) {
    toast.error("Error when trying to start the server", {
      description:
        response.error ||
        "We could not start the server that communicates with the Deno KV database.",
    });
    return null;
  }

  const options: BridgeServerClientOptions = {};
  if (response.result?.authToken) {
    options.authToken = response.result?.authToken;
  }
  return new BridgeServerClient(response.result!.url, options);
}

export async function getOpenedKvStoreClient(): Promise<BridgeServerClient> {
  if (!kvStoresState.openedStore) {
    const message = "There is no opened kv store";
    toast.error(message);
    throw new Error(message);
  } else if (!kvStoresState.openedStoreClient) {
    const openedServer = await bridgeServer.getOpenedServer();
    if (openedServer) {
      const options: BridgeServerClientOptions = {};
      if (openedServer.authToken) {
        options.authToken = openedServer.authToken;
      }
      kvStoresState.openedStoreClient = new BridgeServerClient(openedServer.url, options);
    } else {
      const message = "The kv store has been closed";
      toast.error(message);
      throw new Error(message);
    }
  }

  return kvStoresState.openedStoreClient;
}

const testKvStoreConnectionErrorMessages: Record<KvStore["type"], string> = {
  local: "Either the path to this local KV Store is wrong, moved or deleted",
  remote: "Either authentication failed or the remote server is unreachable.",
  default: "Either the path to this default local KV Store is wrong, moved or deleted",
  bridge: "Either authentication failed or the bridge server is down.",
};

if (metadata.environment !== "production") {
  Object.assign(globalThis, { getOpenedKvStoreClient });
}

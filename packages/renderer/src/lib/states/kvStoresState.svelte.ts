import { globalState } from "$lib/states/globalState.svelte";
import { bridgeServer, kvStoresService } from "@app/preload";
import { toast } from "svelte-sonner";

type StoresState = {
    kvStores: KvStore[];
    loaded: boolean;
    error: string;
    openedStore: KvStore | null;
    openedStoreToEdit: KvStore | null;
    openAddNewStoreForm: boolean;
    renameDefaultKvStore: KvStore | null;
}

export let kvStoresState: StoresState = $state({
    kvStores: [],
    loaded: false,
    error: "",
    openedStore: null,
    openedStoreToEdit: null,
    openAddNewStoreForm: false,
    renameDefaultKvStore: null,
});

export async function loadKvStores() {
    try {
        kvStoresState.kvStores = await kvStoresService.getAll()
        kvStoresState.loaded = true
        kvStoresState.error = ""
    } catch (error) {
        kvStoresState.error = String(error)
        kvStoresState.loaded = false
    }
}

export async function openKvStore(kvStore: KvStore) {
    globalState.loadingOverlay.open = true
    globalState.loadingOverlay.text = "Testing Kv Database Connection..."
    const testSucceed = await kvStoresService.testKvStoreConnection($state.snapshot(kvStore));
    globalState.loadingOverlay.open = false
    globalState.loadingOverlay.text = ""

    if (testSucceed) {
        const isStarted = await startKvStoreServer(kvStore)
        if (isStarted) {
            kvStoresState.openedStore = kvStore;
        }
        return isStarted
    }

    toast.error("Connection Failed", {
        description: testKvStoreConnectionErrorMessages[kvStore.type],
    })
    return false
}

export async function closeKvStore() {
    kvStoresState.openedStore = null;
    bridgeServer.closeServer();
}

async function startKvStoreServer(kvStore: KvStore) {
    let isOpened = false;
    let error = "";

    try {
        globalState.loadingOverlay.open = true
        globalState.loadingOverlay.text = "Starting the Kv bridge server..."
        isOpened = await bridgeServer.openServer($state.snapshot(kvStore));
    } catch (e) {
        error = String(e)
    } finally {
        globalState.loadingOverlay.open = false
        globalState.loadingOverlay.text = ""
    }

    if (!isOpened) {
        toast.error("Error when trying to start the server", {
            description: error || "We could not start the server that communicates with the Deno KV database.",
        });
    }

    return isOpened
}

const testKvStoreConnectionErrorMessages: Record<KvStore["type"], string> = {
    local: "Either the path to this local KV Store is wrong, moved or deleted",
    remote: "Either authentication failed or the remote server is unreachable.",
    default: "Either the path to this default local KV Store is wrong, moved or deleted",
    bridge: "Either authentication failed or the bridge server is down.",
}

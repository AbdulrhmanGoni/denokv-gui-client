import { globalState } from "$lib/states/globalState.svelte";
import { bridgeServer, kvStoresService } from "@app/preload";
import { fetchEntries, resetEntriesState } from "$lib/states/kvEntriesState.svelte";
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
        kvStoresState.openedStore = kvStore;
        await startKvStoreServer(kvStore)
        return true
    }

    toast.error("Connection Failed", {
        description: testKvStoreConnectionErrorMessages[kvStore.type],
    })
    return false
}

export async function closeKvStore() {
    kvStoresState.openedStore = null;
    resetEntriesState();
    bridgeServer.closeServer();
}

async function startKvStoreServer(kvStore: KvStore) {
    try {
        globalState.loadingOverlay.open = true
        globalState.loadingOverlay.text = "Starting the Kv bridge server..."
        const isOpened = await bridgeServer.openServer($state.snapshot(kvStore));
        globalState.loadingOverlay.open = false
        globalState.loadingOverlay.text = ""
        if (isOpened) {
            resetEntriesState();
            await fetchEntries();
        } else {
            toast.error("Failed to open the server", {
                description: "We could not open the server which communicates with the Deno KV database.",
            });
        }
    } catch (error) {
        toast.error("Failed to open the server", {
            description: String(error),
        });
    }
}

const testKvStoreConnectionErrorMessages: Record<KvStore["type"], string> = {
    local: "Either the path to this local KV Store is wrong, moved or deleted",
    remote: "Either the url is wrong or the remote server is unreachable.",
    default: "Either the path to this default local KV Store is wrong, moved or deleted",
    bridge: "Either the url is wrong or the bridge server is not running.",
}

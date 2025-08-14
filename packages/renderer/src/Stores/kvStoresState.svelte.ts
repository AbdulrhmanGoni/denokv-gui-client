import { globalState } from "$lib/globalState.svelte";
import { kvStoresService } from "@app/preload";
import { toast } from "svelte-sonner";

type StoresState = {
    kvStores: KvStore[];
    loaded: boolean;
    error: string;
    openedStore: KvStore | null;
    openedStoreToEdit: KvStore | null;
    openAddNewStoreForm: boolean;
}

export let kvStoresState: StoresState = $state({
    kvStores: [],
    loaded: false,
    error: "",
    openedStore: null,
    openedStoreToEdit: null,
    openAddNewStoreForm: false,
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

export async function openKvStore(kvStore: KvStore | null) {
    if (kvStore) {
        globalState.openLoadingOverlay = true
        const testSucceed = await kvStoresService.testKvStoreConnection($state.snapshot(kvStore));
        globalState.openLoadingOverlay = false
        if (!testSucceed) {
            toast.error("Connection Failed", {
                description: testKvStoreConnectionErrorMessages[kvStore.type],
            })
            return
        }
    }
    kvStoresState.openedStore = kvStore;
}

const testKvStoreConnectionErrorMessages: Record<KvStore["type"], string> = {
    local: "Either the path to this local KV Store is wrong, moved or deleted",
    remote: "Either the url is wrong or the remote server is unreachable.",
    default: "Either the path to this default local KV Store is wrong, moved or deleted",
    bridge: "Either the url is wrong or the bridge server is not running.",
}

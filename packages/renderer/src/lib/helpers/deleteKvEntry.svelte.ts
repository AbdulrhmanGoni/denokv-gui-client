import { removeEntryFromState } from "$lib/states/kvEntriesState.svelte";
import { kvClient } from "@app/preload";
import { toast } from "svelte-sonner";

type DeleteKvEntryOptions = {
    onSuccess?: () => void
    onError?: () => void
    onFinally?: () => void
}

export async function deleteKvEntry(entry: SerializedKvEntry, options?: DeleteKvEntryOptions) {
    const { error } = await kvClient.deleteKey($state.snapshot(entry.key));
    if (error) {
        toast.error("Failed to delete the entry", { description: error });
        options?.onError?.();
    } else {
        toast.success("The entry was deleted successfully");
        removeEntryFromState(entry);
        options?.onSuccess?.();
    }

    options?.onFinally?.();
}
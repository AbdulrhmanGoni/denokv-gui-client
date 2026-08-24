import { removeEntryFromState } from "$lib/states/kvEntriesState.svelte";
import { getOpenedKvStoreClient } from "$lib/states/kvStoresState.svelte";
import { toast } from "svelte-sonner";

type DeleteKvEntryOptions = {
  onSuccess?: () => void;
  onError?: () => void;
  onFinally?: () => void;
};

export async function deleteKvEntry(
  entry: SerializedKvEntry,
  options?: DeleteKvEntryOptions,
) {
  const client = await getOpenedKvStoreClient();

  const { error } = await client.delete(entry.key);
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

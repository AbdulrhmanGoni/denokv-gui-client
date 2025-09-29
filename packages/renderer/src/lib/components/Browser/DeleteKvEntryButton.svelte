<script lang="ts">
  import * as AlertDialog from "$lib/components/shadcn/alert-dialog/index.js";
  import { globalState } from "$lib/states/globalState.svelte";
  import { kvClient } from "@app/preload";
  import TrashIcon from "@lucide/svelte/icons/trash";
  import { toast } from "svelte-sonner";
  import { removeEntryFromState } from "../../states/kvEntriesState.svelte";

  const {
    entry,
    onDeleteSuccess,
  }: { entry: KvEntry; onDeleteSuccess?: () => void } = $props();
  let open = $state(false);
  let isDeleting = $state(false);

  function getOpen() {
    return open;
  }

  function setOpen(state: boolean) {
    open = state;
  }

  async function deleteKvEntry() {
    globalState.loadingOverlay.open = true;
    globalState.loadingOverlay.text = "Deleting Kv Entry...";
    isDeleting = true;

    const { error } = await kvClient.deleteKey($state.snapshot(entry.key));
    if (error) {
      toast.error("Failed to delete entry", { description: error });
    } else {
      toast.success("The entry was deleted successfully");
      setOpen(false);
      removeEntryFromState(entry);
      onDeleteSuccess?.();
    }

    globalState.loadingOverlay.open = false;
    globalState.loadingOverlay.text = "";
    isDeleting = false;
  }
</script>

<AlertDialog.Root bind:open={getOpen, setOpen}>
  <AlertDialog.Trigger
    onclick={(e) => e.stopPropagation()}
    class="flex gap-1 !text-destructive w-full"
  >
    <TrashIcon class="!text-destructive" />
    Delete
  </AlertDialog.Trigger>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
      <AlertDialog.Description>
        This will permanently delete the Kv Entry and you won't be able to undo
        this action.
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel disabled={isDeleting}>Cancel</AlertDialog.Cancel>
      <AlertDialog.Action disabled={isDeleting} onclick={deleteKvEntry}
        >Confirm</AlertDialog.Action
      >
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>

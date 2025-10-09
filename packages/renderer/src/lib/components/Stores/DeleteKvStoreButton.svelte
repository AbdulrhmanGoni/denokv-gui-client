<script lang="ts">
  import TrashIcon from "@lucide/svelte/icons/trash";
  import * as AlertDialog from "$lib/components/shadcn/alert-dialog/index.js";
  import { kvStoresService } from "@app/preload";
  import { kvStoresState } from "../../states/kvStoresState.svelte";
  import { toast } from "svelte-sonner";

  const { kvStore }: { kvStore: KvStore } = $props();

  let openDialog = $state(false);

  function getOpen() {
    return openDialog;
  }

  function setOpen(newOpen: boolean) {
    openDialog = newOpen;
  }

  function deleteKvStore() {
    kvStoresService
      .deleteOne($state.snapshot(kvStore))
      .then((deleted) => {
        if (deleted) {
          kvStoresState.kvStores = kvStoresState.kvStores.filter(
            (c) => c.id != kvStore.id,
          );
          openDialog = false;
        } else {
          toast.error("Failed to delete the kvStore", {
            description: "We could not delete the kvStore for unknown reason",
          });
        }
      })
      .catch((error) => {
        toast.error("Failed to delete the kvStore", {
          description: String(error),
        });
      });
  }

  const isDangerous = kvStore.type == "default" || kvStore.type == "local";
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
      <AlertDialog.Title>
        {#if isDangerous}
          Are you absolutely sure?
        {:else}
          Are you sure?
        {/if}
      </AlertDialog.Title>
      <AlertDialog.Description>
        {#if isDangerous}
          <span class="text-destructive font-medium">
            This will permanently delete the Kv Store with all data inside it
            from your machine.
          </span>
        {:else}
          This will delete the stored info about the Kv Store not the data
          inside it.
        {/if}
        You won't be able to unde this action
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
      <AlertDialog.Action
        class="bg-destructive hover:bg-destructive/85 text-white"
        onclick={deleteKvStore}>Delete</AlertDialog.Action
      >
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>

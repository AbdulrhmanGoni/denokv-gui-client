<script lang="ts">
  import * as AlertDialog from "$lib/components/shadcn/alert-dialog/index.js";
  import { globalState } from "$lib/states/globalState.svelte";
  import { deleteKvEntry } from "$lib/helpers/deleteKvEntry.svelte";
  import type { Snippet } from "svelte";

  type Props = {
    entry: KvEntry;
    children: Snippet;
    className?: string;
    onDeleteSuccess?: () => void;
  };

  const { entry, children, className, onDeleteSuccess }: Props = $props();

  let open = $state(false);
  let isDeleting = $state(false);

  function getOpen() {
    return open;
  }

  function setOpen(state: boolean) {
    open = state;
  }

  async function deleteFn() {
    globalState.loadingOverlay.open = true;
    globalState.loadingOverlay.text = "Deleting Kv Entry...";
    isDeleting = true;

    deleteKvEntry(entry, {
      onSuccess() {
        setOpen(false);
        onDeleteSuccess?.();
      },
      onFinally() {
        globalState.loadingOverlay.open = false;
        globalState.loadingOverlay.text = "";
        isDeleting = false;
      },
    });
  }
</script>

<AlertDialog.Root bind:open={getOpen, setOpen}>
  <AlertDialog.Trigger onclick={(e) => e.stopPropagation()} class={className}>
    {@render children()}
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
      <AlertDialog.Action disabled={isDeleting} onclick={deleteFn}>
        Confirm
      </AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>

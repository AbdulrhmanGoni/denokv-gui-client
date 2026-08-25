<script lang="ts">
  import * as Dialog from "$lib/ui/shadcn/dialog/index.js";
  import { toast } from "svelte-sonner";
  import FileIcon from "@lucide/svelte/icons/file-plus";
  import {
    closeAddKvEntryDialog,
    openAddKvEntryFormState,
  } from "$lib/states/kvEntryDialogState.svelte";
  import KvEntryForm from "../entry-editor/KvEntryForm.svelte";
  import { getOpenedKvStoreClient } from "$lib/states/kvStoresState.svelte";
  import type { SerializedKvEntry, SetKeyOptions } from "@app/bridge-server";

  let addingEntry = $state(false);

  function getOpen() {
    return openAddKvEntryFormState.open;
  }

  function setOpen(newOpen: boolean) {
    openAddKvEntryFormState.open = newOpen;
  }

  async function addEntry(
    key: string,
    value: SerializedKvEntry["value"],
    expires: number,
    overwrite: boolean,
  ) {
    const client = await getOpenedKvStoreClient();

    addingEntry = true;

    const options: SetKeyOptions = { overwrite, jsKey: true };
    if (!isNaN(expires)) options.expires = expires;

    const res = await client.set(key, value, options);
    if (res.result) {
      toast.success("The kv entry was added successfully");
      closeAddKvEntryDialog();
    } else {
      toast.error("Failed to add the kv entry", {
        description: res.error ?? undefined,
      });
    }

    addingEntry = false;
  }
</script>

{#snippet header()}
  <h1 class="flex items-center gap-2 text-2xl font-bold">
    <FileIcon class="size-7" />
    Add a new KV Entry
  </h1>
{/snippet}

<Dialog.Root bind:open={getOpen, setOpen}>
  <Dialog.Content class="max-w-3xl w-full gap-0 p-0">
    <KvEntryForm
      {header}
      onSubmit={addEntry}
      loading={addingEntry}
      onClose={closeAddKvEntryDialog}
      showOverwriteOption
    />
  </Dialog.Content>
</Dialog.Root>

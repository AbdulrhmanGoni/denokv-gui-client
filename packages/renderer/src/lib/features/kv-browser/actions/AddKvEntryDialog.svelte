<script lang="ts">
  import * as Dialog from "$lib/ui/shadcn/dialog/index.js";
  import { kvClient } from "@app/preload";
  import { toast } from "svelte-sonner";
  import FileIcon from "@lucide/svelte/icons/file-plus";
  import {
    closeAddKvEntryDialog,
    openAddKvEntryFormState,
  } from "$lib/states/kvEntryDialogState.svelte";
  import KvEntryForm from "../entry-editor/KvEntryForm.svelte";

  let addingEntry = $state(false);

  function getOpen() {
    return openAddKvEntryFormState.open;
  }

  function setOpen(newOpen: boolean) {
    openAddKvEntryFormState.open = newOpen;
  }

  async function addEntry(
    key: string,
    value: KvEntry["value"],
    expires: number,
  ) {
    addingEntry = true;
    const res = await kvClient.set(
      key,
      value,
      isNaN(expires) ? undefined : { expires },
    );

    if (res.error) {
      toast.error("Failed to add the entry", { description: res.error });
    } else {
      toast.success("The entry was added successfully");
      closeAddKvEntryDialog();
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
    />
  </Dialog.Content>
</Dialog.Root>

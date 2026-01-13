<script lang="ts">
  import * as Dialog from "$lib/ui/shadcn/dialog/index.js";
  import Separator from "$lib/ui/shadcn/separator/separator.svelte";
  import KvValueEditor from "$lib/features/kv-browser/entry-editor/KvValueEditor.svelte";
  import { kvClient } from "@app/preload";
  import { toast } from "svelte-sonner";
  import KvKeyEditor from "$lib/features/kv-browser/entry-editor/KvKeyEditor.svelte";
  import Button from "$lib/ui/shadcn/button/button.svelte";
  import PlusIcon from "@lucide/svelte/icons/plus";
  import FileIcon from "@lucide/svelte/icons/file-plus";
  import LoaderIcon from "@lucide/svelte/icons/loader";
  import XIcon from "@lucide/svelte/icons/x";
  import ValueFileIcon from "@lucide/svelte/icons/file-json";
  import {
    closeAddKvEntryDialog,
    openAddKvEntryFormState,
  } from "$lib/states/kvEntryDialogState.svelte";
  import KvEntryExpirationDate from "$lib/features/kv-browser/entry-editor/KvEntryExpirationDate.svelte";

  let addingEntry = $state(false);
  let kvKeyCodeEditor: KvKeyCodeEditor | undefined = $state();
  const defaultValue = {
    type: "Undefined",
    data: "undefined",
  };
  let kvValueEditorValue: KvEntry["value"] = $state(defaultValue);
  let kvEntryExpirationDateValue: number | undefined = $state();

  function getOpen() {
    return openAddKvEntryFormState.open;
  }

  function setOpen(newOpen: boolean) {
    openAddKvEntryFormState.open = newOpen;
  }

  async function addEntry() {
    addingEntry = true;
    const key = kvKeyCodeEditor!?.toString();
    const { error } = await kvClient.set(
      key,
      $state.snapshot(kvValueEditorValue),
      kvEntryExpirationDateValue
        ? { expires: kvEntryExpirationDateValue }
        : undefined,
    );

    if (error) {
      toast.error("Failed to add the entry", { description: error });
    } else {
      toast.success("The entry was added successfully");
      kvValueEditorValue = defaultValue;
      closeAddKvEntryDialog();
    }

    addingEntry = false;
  }
</script>

<Dialog.Root bind:open={getOpen, setOpen}>
  <Dialog.Content class="max-w-3xl! w-full p-3 gap-0">
    <h1 class="flex items-center gap-2 text-2xl font-bold">
      <FileIcon class="size-7" />
      Add KV Entry
    </h1>
    <Separator class="my-3" />
    <KvKeyEditor bind:jar={kvKeyCodeEditor} />
    <Separator class="my-3" />
    <KvValueEditor
      bind:editorValue={kvValueEditorValue}
      {defaultValue}
      titleIcon={valueFileIcon}
    />
    <Separator class="my-3" />
    <KvEntryExpirationDate bind:value={kvEntryExpirationDateValue} />
    <Separator class="my-3" />
    <div class="flex flex-row-reverse gap-2">
      <Button
        disabled={addingEntry}
        variant="secondary"
        size="sm"
        onclick={addEntry}
      >
        Add
        {#if addingEntry}
          <LoaderIcon class="animate-spin" />
        {:else}
          <PlusIcon />
        {/if}
      </Button>
      <Button
        disabled={addingEntry}
        variant="outline"
        size="sm"
        onclick={closeAddKvEntryDialog}
      >
        <XIcon />
        Close
      </Button>
    </div>
  </Dialog.Content>
</Dialog.Root>

{#snippet valueFileIcon()}
  <ValueFileIcon />
{/snippet}

<script lang="ts">
  import * as Dialog from "$lib/ui/shadcn/dialog/index.js";
  import KvKeyRenderer from "$lib/features/kv-browser/entry-renderer/KvKeyRenderer.svelte";
  import Separator from "$lib/ui/shadcn/separator/separator.svelte";
  import KeyFileIcon from "@lucide/svelte/icons/file-key";
  import CopyKvEntry from "$lib/features/kv-browser/actions/CopyKvEntry.svelte";
  import { kvEntryDialogState } from "$lib/states/kvEntryDialogState.svelte";
  import KvEntryValueUpdator from "$lib/features/kv-browser/entry-editor/KvEntryValueUpdator.svelte";
  import KvValueRenderer from "$lib/features/kv-browser/entry-renderer/KvValueRenderer.svelte";
  import DataFileIcon from "@lucide/svelte/icons/file-braces";
  import PencilIcon from "@lucide/svelte/icons/pencil-line";
  import TrashIcon from "@lucide/svelte/icons/trash";
  import Button, { buttonVariants } from "$lib/ui/shadcn/button/button.svelte";
  import DeleteKvEntryButton from "$lib/features/kv-browser/actions/DeleteKvEntryButton.svelte";
  import { cn } from "$lib/shadcn-utils";

  function getOpen() {
    return kvEntryDialogState.open;
  }

  function setOpen(newOpen: boolean) {
    kvEntryDialogState.open = newOpen;
    if (!newOpen) {
      kvEntryDialogState.entry = null;
      kvEntryDialogState.openValueEditor = false;
    }
  }
</script>

<Dialog.Root bind:open={getOpen, setOpen}>
  <Dialog.Content class="max-w-3xl! w-full p-3 gap-0">
    {#if kvEntryDialogState.entry}
      {@render keySection(kvEntryDialogState.entry)}
      <Separator class="my-3" />
      {#if kvEntryDialogState.openValueEditor}
        <KvEntryValueUpdator entry={kvEntryDialogState.entry} />
      {:else}
        {@render valueSection(kvEntryDialogState.entry)}
      {/if}
    {/if}
  </Dialog.Content>
</Dialog.Root>

{#snippet keySection(entry: KvEntry)}
  <div class="space-y-3">
    <p class="flex gap-2 items-center font-bold text-lg">
      <KeyFileIcon /> Key
    </p>
    <div class="flex gap-2 justify-between bg-card p-3 rounded-md">
      <KvKeyRenderer {entry} className="text-nowrap" />
      <CopyKvEntry isKey {entry} />
    </div>
  </div>
{/snippet}

{#snippet valueSection(entry: KvEntry)}
  <div class="space-y-3 overflow-auto">
    <div class="flex gap-2 items-center">
      <DataFileIcon />
      <p class="font-bold text-lg">Value</p>
    </div>
    <div
      class="overflow-auto h-[270px] flex gap-2 justify-between bg-card p-3 rounded-md"
    >
      <KvValueRenderer {entry} format />
      <CopyKvEntry {entry} />
    </div>
    <div class="flex flex-row-reverse gap-2">
      <Button
        size="sm"
        variant="secondary2"
        onclick={() => {
          kvEntryDialogState.openValueEditor = true;
        }}
      >
        <PencilIcon />
        Edit Entry
      </Button>
      <DeleteKvEntryButton
        {entry}
        className={cn(buttonVariants({ variant: "destructive", size: "sm" }))}
        onDeleteSuccess={() => setOpen(false)}
      >
        <TrashIcon />
        Delete Entry
      </DeleteKvEntryButton>
    </div>
  </div>
{/snippet}

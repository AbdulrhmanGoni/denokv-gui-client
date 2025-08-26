<script lang="ts">
  import * as AlertDialog from "$lib/components/shadcn/alert-dialog/index.js";
  import KvKeyRenderer from "./KvKeyRenderer.svelte";
  import Separator from "$lib/components/shadcn/separator/separator.svelte";
  import KeyFileIcon from "@lucide/svelte/icons/file-key";
  import CopyKvEntry from "./CopyKvEntry.svelte";
  import { kvEntryDialogState } from "./kvEntryDialogState.svelte";
  import KvEntryValueUpdator from "./KvEntryValueUpdator.svelte";
  import KvValueRenderer from "./KvValueRenderer.svelte";
  import DataFileIcon from "@lucide/svelte/icons/file-json";
  import PencilIcon from "@lucide/svelte/icons/pencil";
  import ButtonWithTooltip from "$lib/components/custom/ButtonWithTooltip.svelte";
  import Button from "$lib/components/shadcn/button/button.svelte";
  import XIcon from "@lucide/svelte/icons/x";

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

<AlertDialog.Root bind:open={getOpen, setOpen}>
  <AlertDialog.Content class="!max-w-3xl w-full p-3 gap-0">
    {#if kvEntryDialogState.entry}
      {@render keySection(kvEntryDialogState.entry)}
      <Separator class="my-3" />
      {#if kvEntryDialogState.openValueEditor}
        <KvEntryValueUpdator entry={kvEntryDialogState.entry} />
      {:else}
        {@render valueSection(kvEntryDialogState.entry)}
      {/if}
    {/if}
  </AlertDialog.Content>
</AlertDialog.Root>

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
      <ButtonWithTooltip
        tooltipContent="Edit the value"
        className="ml-auto"
        size="icon"
        variant="outline"
        onclick={() => {
          kvEntryDialogState.openValueEditor = true;
        }}
      >
        <PencilIcon />
      </ButtonWithTooltip>
    </div>
    <div
      class="overflow-auto h-[300px] flex gap-2 justify-between bg-card p-3 rounded-md"
    >
      <KvValueRenderer {entry} format />
      <CopyKvEntry {entry} />
    </div>
    <div class="flex flex-row-reverse gap-2">
      <Button
        variant="outline"
        size="sm"
        onclick={() => {
          setOpen(false);
        }}
      >
        <XIcon />
        Close
      </Button>
    </div>
  </div>
{/snippet}

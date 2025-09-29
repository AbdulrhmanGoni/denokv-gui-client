<script lang="ts">
  import * as AlertDialog from "$lib/components/shadcn/alert-dialog/index.js";
  import Separator from "$lib/components/shadcn/separator/separator.svelte";
  import KvValueEditor from "./KvValueEditor.svelte";
  import { kvClient } from "@app/preload";
  import { toast } from "svelte-sonner";
  import KvKeyEditor from "./KvKeyEditor.svelte";
  import Button from "$lib/components/shadcn/button/button.svelte";
  import PlusIcon from "@lucide/svelte/icons/plus";
  import FileIcon from "@lucide/svelte/icons/file-plus";
  import LoaderIcon from "@lucide/svelte/icons/loader";
  import XIcon from "@lucide/svelte/icons/x";
  import ValueFileIcon from "@lucide/svelte/icons/file-json";
  import {
    closeAddKvEntryDialog,
    globalState,
  } from "$lib/states/globalState.svelte";
  import KvEntryExpirationDate from "./KvEntryExpirationDate.svelte";

  let addingEntry = $state(false);
  let kvKeyCodeEditor: KvKeyCodeEditor | undefined = $state();
  let kvValueCodeEditor: KvValueCodeEditor | undefined = $state();
  let kvEntryExpirationDateValue: number | undefined = $state();

  function getOpen() {
    return globalState.openAddKvEntryForm;
  }

  function setOpen(newOpen: boolean) {
    globalState.openAddKvEntryForm = newOpen;
  }

  async function addEntry() {
    addingEntry = true;
    const key = kvKeyCodeEditor!.toString();
    const value = kvValueCodeEditor!.toKvValue();

    const { error } = await kvClient.set(
      key,
      value,
      kvEntryExpirationDateValue
        ? { expires: kvEntryExpirationDateValue }
        : undefined,
    );

    if (error) {
      toast.error("Failed to add the entry", { description: error });
    } else {
      toast.success("The entry was added successfully");
      closeAddKvEntryDialog();
    }

    addingEntry = false;
  }
</script>

<AlertDialog.Root bind:open={getOpen, setOpen}>
  <AlertDialog.Content class="!max-w-3xl w-full p-3 gap-0">
    <h1 class="flex items-center gap-2 text-2xl font-bold">
      <FileIcon class="size-7" />
      Add Deno KV Entry
    </h1>
    <Separator class="my-3" />
    <KvKeyEditor bind:jar={kvKeyCodeEditor} />
    <Separator class="my-3" />
    <KvValueEditor
      bind:jar={kvValueCodeEditor}
      defaultValue={{ type: "Undefined", data: "undefined" }}
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
  </AlertDialog.Content>
</AlertDialog.Root>

{#snippet valueFileIcon()}
  <ValueFileIcon />
{/snippet}

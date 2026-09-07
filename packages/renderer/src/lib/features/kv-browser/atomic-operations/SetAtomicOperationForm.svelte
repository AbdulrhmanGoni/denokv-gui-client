<script lang="ts">
  import type { SerializedKvEntry } from "@app/bridge-server";
  import KvEntryForm from "../entry-editor/KvEntryForm.svelte";
  import { addAtomicOperation } from "./atomicOperationsState.svelte";
  import FilePlusIcon from "@lucide/svelte/icons/file-plus";
  import * as Dialog from "$lib/ui/shadcn/dialog/index.js";

  let { close }: { close?: () => void } = $props();

  async function addSetOperation(
    key: string,
    value: SerializedKvEntry["value"],
    expiresIn: number,
  ) {
    addAtomicOperation({
      name: "set",
      key,
      value,
      expiresIn: isNaN(expiresIn) ? undefined : expiresIn,
    });
    close?.();
  }
</script>

{#snippet header()}
  <div class="space-y-1">
    <Dialog.Title class="text-2xl font-bold flex gap-2 items-center">
      <FilePlusIcon class="size-7" />
      Set Operation
    </Dialog.Title>
    <Dialog.Description class="text-base">
      <strong>Add</strong> or <strong>Update</strong> a key-value entry in the KV store to the
      given value.
    </Dialog.Description>
  </div>
{/snippet}

<div class="sm:w-xl w-full bg-background rounded-lg">
  <KvEntryForm
    onSubmit={addSetOperation}
    onClose={close}
    {header}
    submitButtonLabel="Add Set Operation"
  />
</div>

<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import {
    openAddKvEntryDialog,
    openLookUpKeyDialog,
  } from "$lib/states/kvEntryDialogState.svelte";
  import Button from "$lib/ui/shadcn/button/button.svelte";
  import { closeKvStore } from "$lib/states/kvStoresState.svelte";
  import KvEntriesTable from "$lib/features/kv-browser/table/KvEntriesTable.svelte";
  import KvEntryDialog from "$lib/features/kv-browser/entry-editor/KvEntryDialog.svelte";
  import PlusIcon from "@lucide/svelte/icons/plus";
  import SearchIcon from "@lucide/svelte/icons/search";
  import ArrowLeftFromLineIcon from "@lucide/svelte/icons/arrow-left-from-line";
  import AddKvEntryDialog from "$lib/features/kv-browser/actions/AddKvEntryDialog.svelte";
  import KvStorePicker from "$lib/features/kv-stores/KvStorePicker.svelte";
  import BrowseParams from "$lib/features/kv-browser/browsing-params/BrowseParams.svelte";
  import {
    createKvEntriesTable,
    fetchEntries,
    kvEntriesState,
    resetEntriesState,
  } from "$lib/states/kvEntriesState.svelte";
  import LookUpKvEntryDialog from "$lib/features/kv-browser/actions/LookUpKvEntryDialog.svelte";
  import RotateCwIcon from "@lucide/svelte/icons/rotate-cw";
  import EnqueueMessage from "$lib/features/kv-browser/enqueue-message/EnqueueMessage.svelte";
  import AtomicOperationsConstructor from "./atomic-operations/AtomicOperationsConstructor.svelte";

  const table = createKvEntriesTable();

  function close() {
    closeKvStore();
  }

  onDestroy(() => {
    close();
    resetEntriesState();
  });

  onMount(fetchEntries);
</script>

<div class="space-y-2 flex flex-col justify-center h-full">
  <div class="flex gap-2 items-center mb-4">
    <Button size="default" variant="outline" onclick={close}>
      <ArrowLeftFromLineIcon class="size-5" />
    </Button>
    <KvStorePicker kvEntriesTable={table} />
  </div>
  <div class="flex gap-2 items-center justify-end">
    <BrowseParams />
    <Button
      size="sm"
      class="me-auto"
      variant="outline"
      onclick={() => {
        kvEntriesState.params.nextCursorIndex -= 1;
        fetchEntries();
      }}
    >
      Reload
      <RotateCwIcon />
    </Button>
    <AtomicOperationsConstructor />
    <EnqueueMessage />
    <Button size="sm" variant="secondary1" onclick={openLookUpKeyDialog}>
      Look up Entry
      <SearchIcon class="rotate-75" />
    </Button>
    <Button size="sm" onclick={openAddKvEntryDialog}>
      Add Entry
      <PlusIcon />
    </Button>
  </div>
  <KvEntriesTable {table} />
  <LookUpKvEntryDialog />
  <KvEntryDialog />
  <AddKvEntryDialog />
</div>

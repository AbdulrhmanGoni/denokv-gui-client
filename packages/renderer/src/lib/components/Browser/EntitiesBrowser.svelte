<script lang="ts">
  import { onDestroy, untrack } from "svelte";
  import { openAddKvEntryDialog } from "$lib/states/kvEntryDialogState.svelte";
  import Button from "$lib/components/shadcn/button/button.svelte";
  import {
    closeKvStore,
    kvStoresState,
  } from "../../states/kvStoresState.svelte";
  import KvEntriesTable from "./KvEntriesTable.svelte";
  import KvEntryDialog from "./KvEntryDialog.svelte";
  import PlusIcon from "@lucide/svelte/icons/plus";
  import ArrowLeftFromLineIcon from "@lucide/svelte/icons/arrow-left-from-line";
  import AddKvEntryDialog from "./AddKvEntryDialog.svelte";
  import KvStorePicker from "../Stores/KvStorePicker.svelte";
  import BrowseParams from "./BrowseParams.svelte";
  import {
    createKvEntriesTable,
    fetchEntries,
    resetEntriesState,
  } from "$lib/states/kvEntriesState.svelte";

  const table = createKvEntriesTable();

  function close() {
    closeKvStore();
  }

  onDestroy(close);

  $effect(() => {
    if (kvStoresState.openedStore?.id) {
      untrack(() => {
        resetEntriesState();
        fetchEntries();
      });
    }
  });
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
    <Button onclick={openAddKvEntryDialog}>
      Add Entry
      <PlusIcon />
    </Button>
  </div>
  <KvEntriesTable {table} />
  <KvEntryDialog />
  <AddKvEntryDialog />
</div>

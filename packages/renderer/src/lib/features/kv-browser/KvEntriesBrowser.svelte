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
    fetchSavedDefaultBrowsingParams,
    kvEntriesState,
    resetEntriesState,
  } from "$lib/states/kvEntriesState.svelte";
  import LookUpKvEntryDialog from "$lib/features/kv-browser/actions/LookUpKvEntryDialog.svelte";
  import RotateCwIcon from "@lucide/svelte/icons/rotate-cw";
  import EnqueueMessage from "$lib/features/kv-browser/enqueue-message/EnqueueMessage.svelte";
  import AtomicOperationsConstructor from "./atomic-operations/AtomicOperationsConstructor.svelte";
  import {
    fetchWatchedKeysForOpenedKvStore,
    openWatchedKvEntriesDialog,
    resetWatchedKvEntriesState,
    startWatchingKvEntries,
  } from "$lib/states/watchedKvEntriesState.svelte";
  import WatchedKeysDialog from "./watched-keys/WatchedKeysDialog.svelte";
  import { registerShortcuts } from "$lib/states/shortcutsState.svelte";
  import { openAtomicOperationsDialog } from "./atomic-operations/atomicOperationsDialogState.svelte";
  import { openEnqueueMessageDialog } from "./enqueue-message/enqueueMessageDialogState.svelte";
  import { openBrowsingParamsDialog } from "./browsing-params/browsingParamsDialogState.svelte";

  const table = createKvEntriesTable();

  function close() {
    closeKvStore();
  }

  function reloadEntries() {
    kvEntriesState.params.cursors.pop();
    fetchEntries();
  }

  registerShortcuts({
    id: "kv-browser",
    label: "Kv Browser",
    shortcuts: [
      {
        combo: "Ctrl+N",
        description: "Add a new Kv entry",
        handler: openAddKvEntryDialog,
      },
      {
        combo: "Alt+F",
        description: "Filter Kv entries",
        handler: openBrowsingParamsDialog,
      },
      {
        combo: "Alt+L",
        description: "Look up a Kv entry by its key",
        handler: openLookUpKeyDialog,
      },
      {
        combo: "Alt+A",
        description: "Perform atomic operations",
        handler: openAtomicOperationsDialog,
      },
      {
        combo: "Alt+Q",
        description: "Enqueue a message into Deno Kv Queue",
        handler: openEnqueueMessageDialog,
      },
      {
        combo: "Alt+W",
        description: "Open the watched keys dialog",
        handler: openWatchedKvEntriesDialog,
      },
      {
        combo: "Alt+R",
        description: "Reload the entries table",
        handler: reloadEntries,
      },
    ],
  });

  onDestroy(() => {
    close();
    resetEntriesState();
  });

  onMount(async () => {
    await fetchSavedDefaultBrowsingParams();
    await fetchEntries();
    resetWatchedKvEntriesState();
    await fetchWatchedKeysForOpenedKvStore();
    await startWatchingKvEntries();
  });
</script>

<div class="space-y-2 flex flex-col h-full">
  <div class="flex gap-2 items-center justify-between mb-4">
    <div class="flex gap-2 items-center">
      <Button size="default" variant="outline" onclick={close}>
        <ArrowLeftFromLineIcon class="size-5" />
      </Button>
      <KvStorePicker kvEntriesTable={table} />
    </div>
    <WatchedKeysDialog />
  </div>
  <div class="flex gap-2 items-center justify-end">
    <BrowseParams />
    <Button size="sm" class="me-auto" variant="outline" onclick={reloadEntries}>
      Reload
      <RotateCwIcon />
    </Button>
    <AtomicOperationsConstructor />
    <EnqueueMessage />
    <Button class="gap-1" size="sm" variant="secondary1" onclick={openLookUpKeyDialog}>
      Look Up
      <SearchIcon class="rotate-75" />
    </Button>
    <Button class="gap-0.5" size="sm" onclick={openAddKvEntryDialog}>
      New
      <PlusIcon />
    </Button>
  </div>
  <KvEntriesTable {table} />
  <LookUpKvEntryDialog />
  <KvEntryDialog />
  <AddKvEntryDialog />
</div>

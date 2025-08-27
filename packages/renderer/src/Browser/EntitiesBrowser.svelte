<script lang="ts">
  import { onDestroy } from "svelte";
  import { openAddKvEntryDialog } from "$lib/globalState.svelte";
  import Button from "$lib/components/shadcn/button/button.svelte";
  import { closeKvStore } from "../Stores/kvStoresState.svelte";
  import KvEntriesTable from "./KvEntriesTable.svelte";
  import KvEntryDialog from "./KvEntryDialog.svelte";
  import PlusIcon from "@lucide/svelte/icons/plus";
  import ArrowLeftFromLineIcon from "@lucide/svelte/icons/arrow-left-from-line";
  import AddKvEntryDialog from "./AddKvEntryDialog.svelte";
  import KvStorePicker from "../Stores/KvStorePicker.svelte";
  import BrowseParams from "./BrowseParams.svelte";

  onDestroy(closeKvStore);
</script>

<div class="space-y-2 flex flex-col justify-center h-full">
  <div class="flex gap-2 items-center mb-4">
    <Button size="default" variant="outline" onclick={closeKvStore}>
      <ArrowLeftFromLineIcon class="size-5" />
    </Button>
    <KvStorePicker />
  </div>
  <div class="flex gap-2 items-center justify-end">
    <BrowseParams />
    <Button onclick={openAddKvEntryDialog} size="sm">
      Add Kv Entry
      <PlusIcon />
    </Button>
  </div>
  <KvEntriesTable />
  <KvEntryDialog />
  <AddKvEntryDialog />
</div>

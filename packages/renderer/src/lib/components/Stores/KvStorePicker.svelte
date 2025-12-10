<script lang="ts">
  import * as Select from "$lib/components/shadcn/select/index.js";
  import {
    kvStoresState,
    openKvStore,
  } from "../../states/kvStoresState.svelte";
  import ServerIcon from "@lucide/svelte/icons/server";
  import GlobeIcon from "@lucide/svelte/icons/globe";
  import FileIcon from "@lucide/svelte/icons/file";
  import LocalStorageIcon from "@lucide/svelte/icons/hard-drive";
  import type { Table } from "@tanstack/table-core";

  const { kvEntriesTable }: { kvEntriesTable: Table<SerializedKvEntry> } =
    $props();

  let openedKvStoreId = $derived(kvStoresState.openedStore?.id);

  async function onKvStoreChange(kvStoreId: string) {
    const chosenKvStore = kvStoresState.kvStores.find(
      (kv) => kv.id == kvStoreId,
    )!;

    const open = await openKvStore(chosenKvStore);
    if (!open) {
      openedKvStoreId = kvStoresState.openedStore!.id;
    } else {
      kvEntriesTable.resetRowSelection();
    }
  }
</script>

<Select.Root
  type="single"
  onValueChange={onKvStoreChange}
  bind:value={openedKvStoreId}
>
  <Select.Trigger class="text-base">
    {@render item(kvStoresState.openedStore!)}
  </Select.Trigger>
  <Select.Content>
    {#each kvStoresState.kvStores as kvStore (kvStore.id)}
      <Select.Item value={kvStore.id}>
        {@render item(kvStore)}
      </Select.Item>
    {/each}
  </Select.Content>
</Select.Root>

{#snippet item(kvStore: KvStore)}
  <div class="flex! gap-2 items-center max-w-sm py-1">
    {#if kvStore.type == "remote"}
      <GlobeIcon class="text-secondary shrink-0 size-5" />
    {:else if kvStore.type == "default"}
      <FileIcon class="text-secondary-2 shrink-0 size-5" />
    {:else if kvStore.type == "local"}
      <LocalStorageIcon class="text-secondary-3 shrink-0 size-5" />
    {:else if kvStore.type == "bridge"}
      <ServerIcon class="text-secondary-1 shrink-0 size-5" />
    {/if}
    <p class="line-clamp-1">{kvStore.name}</p>
  </div>
{/snippet}

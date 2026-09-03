<script lang="ts">
  import * as Select from "$lib/ui/shadcn/select/index.js";
  import { kvStoresState, openKvStore } from "$lib/states/kvStoresState.svelte";
  import ServerIcon from "@lucide/svelte/icons/server";
  import GlobeIcon from "@lucide/svelte/icons/globe";
  import FileIcon from "@lucide/svelte/icons/file";
  import LocalStorageIcon from "@lucide/svelte/icons/hard-drive";
  import type { Table } from "@tanstack/table-core";
  import { fetchEntries, resetEntriesState } from "$lib/states/kvEntriesState.svelte";
  import {
    fetchWatchedKeysForOpenedKvStore,
    resetWatchedKvEntriesState,
    startWatchingKvEntries,
  } from "$lib/states/watchedKvEntriesState.svelte";
  import type { SerializedKvEntry } from "@app/bridge-server";
  import type { KvStore } from "@app/main";

  const { kvEntriesTable }: { kvEntriesTable: Table<SerializedKvEntry> } = $props();

  let openedKvStoreId = $derived(kvStoresState.openedStore?.id);

  async function onKvStoreChange(kvStoreId: string) {
    const chosenKvStore = kvStoresState.kvStores.find((kv) => kv.id == kvStoreId)!;

    const open = await openKvStore(chosenKvStore);
    if (open) {
      kvEntriesTable.resetRowSelection();
      await resetEntriesState();
      await fetchEntries();
      resetWatchedKvEntriesState();
      await fetchWatchedKeysForOpenedKvStore();
      await startWatchingKvEntries();
    } else {
      openedKvStoreId = kvStoresState.openedStore!.id;
    }
  }

  const groups = $derived.by(() => {
    const groupsMap = new Map<string, KvStore[]>();
    for (const kvStore of kvStoresState.kvStores) {
      const group = groupsMap.get(kvStore.type);
      if (group) {
        group.push(kvStore);
      } else {
        groupsMap.set(kvStore.type, [kvStore]);
      }
    }
    return groupsMap;
  });
</script>

<Select.Root type="single" onValueChange={onKvStoreChange} bind:value={openedKvStoreId}>
  <Select.Trigger class="text-base">
    {#if kvStoresState.openedStore}
      {@render item(kvStoresState.openedStore)}
    {/if}
  </Select.Trigger>
  <Select.Content class="max-h-100">
    {#each groups.entries() as [type, stores] (type)}
      <Select.Group class="space-y-0.5">
        <Select.Label>{type[0].toUpperCase() + type.slice(1)} Kv Stores</Select.Label>
        {#each stores as kvStore (kvStore.id)}
          <Select.Item
            value={kvStore.id}
            class={kvStore.id === kvStoresState.openedStore?.id ? "bg-muted!" : ""}
          >
            {@render item(kvStore)}
          </Select.Item>
        {/each}
      </Select.Group>
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

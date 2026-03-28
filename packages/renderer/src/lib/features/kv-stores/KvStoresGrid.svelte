<script lang="ts">
  import {
    kvStoresState,
    loadKvStores,
  } from "$lib/states/kvStoresState.svelte";
  import DatabaseIcon from "@lucide/svelte/icons/database";
  import PlusIcon from "@lucide/svelte/icons/circle-plus";
  import AlertIcon from "@lucide/svelte/icons/octagon-alert";
  import CircleOff from "@lucide/svelte/icons/circle-off";
  import GlobeIcon from "@lucide/svelte/icons/globe";
  import ServerIcon from "@lucide/svelte/icons/server";
  import HardDriveIcon from "@lucide/svelte/icons/hard-drive";
  import FileIcon from "@lucide/svelte/icons/file";
  import SearchXIcon from "@lucide/svelte/icons/search-x";
  import FilterKvStoresChip from "./FilterKvStoresChip.svelte";
  import KvStoreCard from "./KvStoreCard.svelte";
  import Button from "$lib/ui/shadcn/button/button.svelte";
  import Separator from "$lib/ui/shadcn/separator/separator.svelte";
  import { onMount } from "svelte";

  onMount(loadKvStores);

  const filterOptions = [
    {
      label: "Remote",
      type: "remote" as const,
      icon: GlobeIcon,
      color: "secondary",
    },
    {
      label: "Local",
      type: "local" as const,
      icon: HardDriveIcon,
      color: "secondary-3",
    },
    {
      label: "Default",
      type: "default" as const,
      icon: FileIcon,
      color: "secondary-2",
    },
    {
      label: "Bridge",
      type: "bridge" as const,
      icon: ServerIcon,
      color: "secondary-1",
    },
  ];

  function toggleFilter(type: (typeof filterOptions)[0]["type"]) {
    if (kvStoresState.selectedTypes.includes(type)) {
      kvStoresState.selectedTypes = kvStoresState.selectedTypes.filter(
        (t) => t !== type,
      );
    } else {
      kvStoresState.selectedTypes = [...kvStoresState.selectedTypes, type];
    }
  }

  const filteredKvStores = $derived.by(() => {
    if (kvStoresState.selectedTypes.length === 0) {
      return kvStoresState.kvStores;
    }
    return kvStoresState.kvStores.filter((store) => {
      return kvStoresState.selectedTypes.includes(store.type);
    });
  });
</script>

<div
  class="text-card-foreground flex flex-col gap-2 rounded-md border p-3 shadow-sm h-full"
>
  <div class="flex items-end justify-between gap-3">
    <div>
      <h1 class="text-2xl font-bold flex items-center gap-2 mb-1">
        <DatabaseIcon class="size-7" />
        Kv Stores
      </h1>
      <p class="text-muted-foreground">
        Double click on a Kv Store card to open and browse it.
      </p>
    </div>
    {#if kvStoresState.kvStores.length != 0}
      {@render addKvStoreButton()}
    {/if}
  </div>
  <Separator />
  <div class="flex flex-wrap gap-2">
    {#each filterOptions as option}
      <FilterKvStoresChip
        {option}
        isSelected={kvStoresState.selectedTypes.includes(option.type)}
        onclick={() => toggleFilter(option.type)}
      />
    {/each}
  </div>
  {#if kvStoresState.error}
    <div class="text-center flex-1 flex flex-col justify-center items-center">
      <AlertIcon class="text-destructive size-10 mb-2" />
      <p class="text-foreground font-semibold text-xl">
        Failed to fetch Kv Stores
      </p>
      <p class="text-destructive">
        <span class="">{kvStoresState.error}</span>
      </p>
    </div>
  {:else if kvStoresState.kvStores.length == 0}
    <div
      class="text-center flex-1 flex gap-2 flex-col justify-center items-center"
    >
      <CircleOff class="size-10" />
      <div class="text-muted-foreground text-center">
        <p class="text-foreground font-semibold text-xl">
          No kv stores are available
        </p>
        <p>Start by adding a new kv store, and then open and explore it!</p>
      </div>
      {@render addKvStoreButton()}
    </div>
  {:else if filteredKvStores.length === 0}
    <div
      class="text-center flex-1 gap-2 flex flex-col justify-center items-center"
    >
      <SearchXIcon class="text-muted-foreground size-10" />
      <p class="text-foreground font-semibold text-xl">No matching Kv Stores</p>
      <p class="text-muted-foreground">
        No kv stores found matching the selected type filters.
      </p>
      <Button
        variant="outline"
        onclick={() => (kvStoresState.selectedTypes = [])}
      >
        Clear filters
      </Button>
    </div>
  {:else}
    <div
      id="kv-stores-grid"
      class="grid grid-cols-1 sm:grid-cols-2 gap-2 overflow-y-auto pe-1.5"
    >
      {#each filteredKvStores as kvStore (kvStore.id)}
        <KvStoreCard {kvStore} />
      {/each}
    </div>
  {/if}
</div>

{#snippet addKvStoreButton()}
  <Button
    onclick={() => {
      kvStoresState.openAddNewStoreForm = true;
    }}
  >
    Add Kv Store
    <PlusIcon class="size-5" />
  </Button>
{/snippet}

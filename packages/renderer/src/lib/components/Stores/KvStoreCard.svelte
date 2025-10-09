<script lang="ts">
  import { openKvStore } from "../../states/kvStoresState.svelte";
  import ServerIcon from "@lucide/svelte/icons/server";
  import GlobeIcon from "@lucide/svelte/icons/globe";
  import FileIcon from "@lucide/svelte/icons/file";
  import LocalStorageIcon from "@lucide/svelte/icons/hard-drive";
  import CalendarSync from "@lucide/svelte/icons/calendar-sync";
  import CalendarFold from "@lucide/svelte/icons/calendar-fold";
  import { formatTimeAgo } from "$lib/helpers/formatTimeAgo";
  import KvStorePathOrUrl from "./KvStorePathOrUrl.svelte";
  import KvStoreCardActions from "./KvStoreCardActions.svelte";

  const { kvStore }: { kvStore: KvStore } = $props();
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="bg-card rounded-md shadow-md text-muted-foreground p-4 space-y-2 transition w-full h-full"
  ondblclick={() => {
    openKvStore(kvStore);
  }}
>
  <div class="flex justify-between items-center gap-2 mb-3.5">
    {#if kvStore.type == "remote"}
      <GlobeIcon class="text-secondary shrink-0 size-5" />
    {:else if kvStore.type == "default"}
      <FileIcon class="text-secondary-2 shrink-0 size-5" />
    {:else if kvStore.type == "local"}
      <LocalStorageIcon class="text-secondary-3 shrink-0 size-5" />
    {:else if kvStore.type == "bridge"}
      <ServerIcon class="text-secondary-1 shrink-0 size-5" />
    {/if}
    <p class="flex-1 font-semibold line-clamp-1 text-foreground">
      {kvStore.name}
    </p>
    <div class="flex gap-2 items-center justify-end">
      <KvStoreCardActions {kvStore} />
    </div>
  </div>
  <KvStorePathOrUrl {kvStore} />
  <p class="flex gap-2 items-center text-sm">
    <CalendarFold class="size-4" />
    Created:
    <span>{formatTimeAgo(new Date(kvStore.createdAt))}</span>
  </p>
  <p class="flex gap-2 items-center text-sm">
    <CalendarSync class="size-4" />
    Last Update:
    <span>{formatTimeAgo(new Date(kvStore.updatedAt))}</span>
  </p>
</div>

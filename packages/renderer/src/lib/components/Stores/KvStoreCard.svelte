<script lang="ts">
  import {
    kvStoresState,
    openKvStore,
  } from "../../states/kvStoresState.svelte";
  import ServerIcon from "@lucide/svelte/icons/server";
  import GlobeIcon from "@lucide/svelte/icons/globe";
  import FileIcon from "@lucide/svelte/icons/file";
  import LocalStorageIcon from "@lucide/svelte/icons/hard-drive";
  import CalendarSync from "@lucide/svelte/icons/calendar-sync";
  import CalendarFold from "@lucide/svelte/icons/calendar-fold";
  import SquarePenIcon from "@lucide/svelte/icons/square-pen";
  import DeleteKvStoreButton from "./DeleteKvStoreButton.svelte";
  import ButtonWithTooltip from "$lib/components/custom/ButtonWithTooltip.svelte";
  import RenameIcon from "@lucide/svelte/icons/case-upper";
  import { formatTimeAgo } from "$lib/helpers/formatTimeAgo";
  import KvStorePathOrUrl from "./KvStorePathOrUrl.svelte";

  const { kvStore }: { kvStore: KvStore } = $props();
</script>

<div
  class="bg-card rounded-md shadow-md text-muted-foreground p-4 space-y-2 transition w-full h-full"
  ondblclickcapture={() => {
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
      {#if kvStore.type != "default"}
        <ButtonWithTooltip
          onclick={() => {
            kvStoresState.openedStoreToEdit = kvStore;
          }}
          size="icon"
          variant="secondary"
          tooltipContent="Edit"
        >
          <SquarePenIcon />
        </ButtonWithTooltip>
      {:else}
        <ButtonWithTooltip
          onclick={() => {
            kvStoresState.renameDefaultKvStore = kvStore;
          }}
          size="icon"
          variant="secondary2"
          tooltipContent="Rename"
        >
          <RenameIcon />
        </ButtonWithTooltip>
      {/if}
      <DeleteKvStoreButton {kvStore} />
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

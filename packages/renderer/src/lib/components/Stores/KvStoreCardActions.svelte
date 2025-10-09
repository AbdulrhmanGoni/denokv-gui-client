<script lang="ts">
  import * as DropdownMenu from "$lib/components/shadcn/dropdown-menu/index.js";
  import EllipsisIcon from "@lucide/svelte/icons/ellipsis-vertical";
  import SquarePenIcon from "@lucide/svelte/icons/square-pen";
  import FilePenIcon from "@lucide/svelte/icons/file-pen-line";
  import SquareArrowOutUpRightIcon from "@lucide/svelte/icons/square-arrow-out-up-right";
  import OpenPathIcon from "@lucide/svelte/icons/folder-open";
  import { Button } from "$lib/components/shadcn/button/index.js";
  import { kvStoresState, openKvStore } from "$lib/states/kvStoresState.svelte";
  import DeleteKvStoreButton from "./DeleteKvStoreButton.svelte";
  import { openPath } from "@app/preload";

  const { kvStore }: { kvStore: KvStore } = $props();

  let openMenu = $state(false);

  function getOpenMenu() {
    return openMenu;
  }

  function setOpenMenu(state: boolean) {
    openMenu = state;
  }
</script>

<DropdownMenu.Root bind:open={getOpenMenu, setOpenMenu}>
  <DropdownMenu.Trigger>
    {#snippet child({ props })}
      <Button
        {...props}
        variant="ghost"
        size="icon"
        class="relative p-0 text-foreground"
      >
        <EllipsisIcon class="size-5" />
      </Button>
    {/snippet}
  </DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Item onclick={() => openKvStore(kvStore)}>
      <SquareArrowOutUpRightIcon />
      Browse
    </DropdownMenu.Item>
    <DropdownMenu.Item
      onclick={() => {
        if (kvStore.type == "default") {
          kvStoresState.renameDefaultKvStore = kvStore;
        } else {
          kvStoresState.openedStoreToEdit = kvStore;
        }
      }}
    >
      {#if kvStore.type == "default"}
        <FilePenIcon /> Rename
      {:else}
        <SquarePenIcon /> Edit
      {/if}
    </DropdownMenu.Item>
    {#if kvStore.type == "default"}
      <DropdownMenu.Item onclick={() => openPath(kvStore.url)}>
        <OpenPathIcon /> Open Path
      </DropdownMenu.Item>
    {/if}
    <DropdownMenu.Separator />
    <DropdownMenu.Item>
      <DeleteKvStoreButton {kvStore} />
    </DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>

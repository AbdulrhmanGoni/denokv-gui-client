<script lang="ts">
  import EllipsisIcon from "@lucide/svelte/icons/ellipsis";
  import EditIcon from "@lucide/svelte/icons/pencil";
  import NotepadTextIcon from "@lucide/svelte/icons/notepad-text";
  import CopyKeyIcon from "@lucide/svelte/icons/copy";
  import CopyValueIcon from "@lucide/svelte/icons/clipboard-copy";
  import TagsIcon from "@lucide/svelte/icons/tags";
  import TrashIcon from "@lucide/svelte/icons/trash";
  import { Button } from "$lib/ui/shadcn/button/index.js";
  import * as DropdownMenu from "$lib/ui/shadcn/dropdown-menu/index.js";
  import DeleteKvEntryButton from "$lib/features/kv-browser/actions/DeleteKvEntryButton.svelte";
  import { openKvEntryDialog } from "$lib/states/kvEntryDialogState.svelte";
  import {
    copyEntryKey,
    copyEntryValue,
    copyEntryVersionStamp,
  } from "../utils/copyKvEntry";

  const { entry }: { entry: KvEntry } = $props();

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
      <div class="flex justify-end">
        <Button
          {...props}
          variant="ghost"
          size="icon"
          class="relative size-8 p-0"
        >
          <EllipsisIcon />
        </Button>
      </div>
    {/snippet}
  </DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Item onclick={() => openKvEntryDialog(entry)}>
      <NotepadTextIcon />
      View
    </DropdownMenu.Item>
    <DropdownMenu.Item onclick={() => copyEntryKey(entry)}>
      <CopyKeyIcon /> Copy Key
    </DropdownMenu.Item>
    <DropdownMenu.Item onclick={() => copyEntryValue(entry)}>
      <CopyValueIcon /> Copy Value
    </DropdownMenu.Item>
    <DropdownMenu.Item onclick={() => copyEntryVersionStamp(entry)}>
      <TagsIcon /> Copy Version
    </DropdownMenu.Item>
    <DropdownMenu.Item onclick={() => openKvEntryDialog(entry, true)}>
      <EditIcon /> Edit
    </DropdownMenu.Item>
    <DropdownMenu.Separator />
    <DropdownMenu.Item>
      <DeleteKvEntryButton
        className="flex gap-1 text-destructive! w-full"
        {entry}
        onDeleteSuccess={() => setOpenMenu(false)}
      >
        <TrashIcon class="text-destructive!" />
        Delete
      </DeleteKvEntryButton>
    </DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>

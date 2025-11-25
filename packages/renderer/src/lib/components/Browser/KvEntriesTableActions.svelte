<script lang="ts">
  import EllipsisIcon from "@lucide/svelte/icons/ellipsis";
  import EditIcon from "@lucide/svelte/icons/pencil";
  import NotepadTextIcon from "@lucide/svelte/icons/notepad-text";
  import CopyKeyIcon from "@lucide/svelte/icons/copy";
  import CopyValueIcon from "@lucide/svelte/icons/clipboard-copy";
  import TagsIcon from "@lucide/svelte/icons/tags";
  import { Button } from "$lib/components/shadcn/button/index.js";
  import * as DropdownMenu from "$lib/components/shadcn/dropdown-menu/index.js";
  import DeleteKvEntryButton from "./DeleteKvEntryButton.svelte";
  import { openKvEntryDialog } from "$lib/states/kvEntryDialogState.svelte";

  const { entry }: { entry: KvEntry } = $props();

  let openMenu = $state(false);

  function copy(text: string) {
    navigator.clipboard.writeText(text);
  }

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
    <DropdownMenu.Item onclick={() => copy(JSON.stringify(entry.key))}>
      <CopyKeyIcon /> Copy Key
    </DropdownMenu.Item>
    <DropdownMenu.Item onclick={() => copy(String(entry.value.data))}>
      <CopyValueIcon /> Copy Value
    </DropdownMenu.Item>
    <DropdownMenu.Item onclick={() => copy(entry.versionstamp)}>
      <TagsIcon /> Copy Version
    </DropdownMenu.Item>
    <DropdownMenu.Item onclick={() => openKvEntryDialog(entry, true)}>
      <EditIcon /> Edit
    </DropdownMenu.Item>
    <DropdownMenu.Separator />
    <DropdownMenu.Item>
      <DeleteKvEntryButton {entry} onDeleteSuccess={() => setOpenMenu(false)} />
    </DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>

<script lang="ts">
  import Button from "$lib/components/shadcn/button/button.svelte";
  import { kvClient } from "@app/preload";
  import { toast } from "svelte-sonner";
  import { kvEntryDialogState } from "$lib/states/kvEntryDialogState.svelte";
  import KvValueEditor from "./KvValueEditor.svelte";
  import SaveIcon from "@lucide/svelte/icons/save";
  import XIcon from "@lucide/svelte/icons/x";
  import EditFileIcon from "@lucide/svelte/icons/file-pen";
  import { globalState } from "$lib/states/globalState.svelte";

  const { entry }: { entry: KvEntry } = $props();

  let kvValueEditorValue: KvEntry["value"] = $state(
    $state.snapshot(entry.value),
  );

  async function saveChanges() {
    if (
      kvValueEditorValue.type != entry.value.type ||
      kvValueEditorValue.data != entry.value.data
    ) {
      globalState.loadingOverlay.open = true;
      globalState.loadingOverlay.text = "Updating entry...";
      const { error } = await kvClient.set(
        $state.snapshot(entry).key,
        $state.snapshot(kvValueEditorValue),
      );

      if (error) {
        toast.error("Failed to save changes", { description: error });
      } else {
        toast.success("The changes was saved successfully");
      }

      kvEntryDialogState.openValueEditor = false;
      globalState.loadingOverlay.open = false;
      globalState.loadingOverlay.text = "";
    } else {
      toast.warning("No changes to the value");
    }
  }
</script>

<div class="space-y-3 overflow-auto">
  <KvValueEditor
    bind:editorValue={kvValueEditorValue}
    defaultValue={entry.value}
    titleIcon={editFileIcon}
  />
  <div class="flex flex-row-reverse gap-2">
    <Button variant="secondary" size="sm" onclick={saveChanges}>
      <SaveIcon />
      Save
    </Button>
    <Button
      variant="destructive"
      size="sm"
      onclick={() => {
        kvEntryDialogState.openValueEditor = false;
      }}
    >
      <XIcon />
      Cancel
    </Button>
  </div>
</div>

{#snippet editFileIcon()}
  <EditFileIcon />
{/snippet}

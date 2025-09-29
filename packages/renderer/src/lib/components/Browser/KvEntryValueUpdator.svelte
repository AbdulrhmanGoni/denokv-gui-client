<script lang="ts">
  import Button from "$lib/components/shadcn/button/button.svelte";
  import { kvClient } from "@app/preload";
  import { toast } from "svelte-sonner";
  import { kvEntryDialogState } from "./kvEntryDialogState.svelte";
  import KvValueEditor from "./KvValueEditor.svelte";
  import SaveIcon from "@lucide/svelte/icons/save";
  import XIcon from "@lucide/svelte/icons/x";
  import EditFileIcon from "@lucide/svelte/icons/file-pen";

  const { entry }: { entry: KvEntry } = $props();

  let jar: KvValueCodeEditor | undefined = $state();

  async function saveChanges() {
    if (jar) {
      const { error } = await kvClient.set(
        $state.snapshot(entry!).key,
        jar.toKvValue()
      );

      if (error) {
        toast.error("Failed to save changes", { description: error });
      } else {
        toast.success("The changes was saved successfully");
      }

      kvEntryDialogState.openValueEditor = false;
    }
  }
</script>

<div class="space-y-3 overflow-auto">
  <KvValueEditor bind:jar defaultValue={entry.value} titleIcon={editFileIcon} />
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

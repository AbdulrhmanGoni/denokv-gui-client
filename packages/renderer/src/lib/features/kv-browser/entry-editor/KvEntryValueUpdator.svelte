<script lang="ts">
  import Button from "$lib/ui/shadcn/button/button.svelte";
  import { toast } from "svelte-sonner";
  import {
    kvEntryDialogState,
    updateOpenKvEntry,
  } from "$lib/states/kvEntryDialogState.svelte";
  import KvValueEditor from "$lib/features/kv-browser/entry-editor/KvValueEditor.svelte";
  import SaveIcon from "@lucide/svelte/icons/save";
  import XIcon from "@lucide/svelte/icons/x";
  import EditFileIcon from "@lucide/svelte/icons/file-pen";
  import { globalState } from "$lib/states/globalState.svelte";
  import { kvEntriesState } from "$lib/states/kvEntriesState.svelte";
  import { isSameKvKey } from "@app/bridge-server/kv-utils";
  import { bridgeServer } from "@app/preload";
  import { getOpenedKvStoreClient } from "$lib/states/kvStoresState.svelte";

  const { entry }: { entry: KvEntry } = $props();

  let kvValueEditorValue: KvEntry["value"] = $state($state.snapshot(entry.value));

  async function saveChanges() {
    if (
      kvValueEditorValue.type != entry.value.type ||
      kvValueEditorValue.data != entry.value.data
    ) {
      const client = await getOpenedKvStoreClient();

      globalState.loadingOverlay.open = true;
      globalState.loadingOverlay.text = "Updating entry...";
      const { error, result } = await client.set(entry.key, kvValueEditorValue);

      if (result && result.ok) {
        const updatedEntry = {
          key: entry.key,
          value: normalizeNewValue(kvValueEditorValue),
          versionstamp: result.versionstamp,
        };

        updateOpenKvEntry(updatedEntry);

        kvEntriesState.entries = kvEntriesState.entries.map((existingEntry) =>
          isSameKvKey(existingEntry.key, updatedEntry.key) ? updatedEntry : existingEntry,
        );

        toast.success("The changes was saved successfully");
      } else {
        const message = error || "The bridge server couldn't set the new value";
        toast.error("Failed to save changes", { description: message });
      }

      kvEntryDialogState.openValueEditor = false;
      globalState.loadingOverlay.open = false;
      globalState.loadingOverlay.text = "";
    } else {
      toast.warning("No changes to the value");
    }
  }

  function normalizeNewValue(value: KvEntry["value"]) {
    if (
      value.type === "Object" ||
      value.type === "Array" ||
      value.type === "Set" ||
      value.type === "Map" ||
      value.type === "Uint8Array"
    ) {
      return bridgeServer.utils.serializeKvValue(
        bridgeServer.utils.deserializeKvValue(value),
        false,
      );
    }

    return value;
  }
</script>

<div class="space-y-3 overflow-auto">
  <KvValueEditor
    bind:editorValue={kvValueEditorValue}
    defaultValue={entry.value}
    titleIcon={editFileIcon}
  />
  <div class="flex flex-row-reverse gap-2">
    <Button variant="secondary2" size="sm" onclick={saveChanges}>
      Save
      <SaveIcon />
    </Button>
    <Button
      variant="outline"
      size="sm"
      onclick={() => {
        kvEntryDialogState.openValueEditor = false;
      }}
    >
      Cancel
      <XIcon />
    </Button>
  </div>
</div>

{#snippet editFileIcon()}
  <EditFileIcon />
{/snippet}

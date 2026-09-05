<script lang="ts">
  import { ModeWatcher } from "mode-watcher";
  import { closeKvStore, kvStoresState } from "$lib/states/kvStoresState.svelte";
  import Header from "$lib/layout/Header.svelte";
  import KvEntriesBrowser from "$lib/features/kv-browser/KvEntriesBrowser.svelte";
  import KvStoresManagement from "$lib/features/kv-stores/KvStoresManagement.svelte";
  import { Toaster } from "$lib/ui/shadcn/sonner";
  import LoadingOverlay from "$lib/ui/primitives/LoadingOverlay.svelte";
  import { metadata } from "@app/preload";
  import { loadSettings, settingsState } from "$lib/states/settingsState.svelte";
  import { onDestroy, onMount } from "svelte";
  import { startCheckingForUpdates } from "$lib/states/appUpdate.svelte";
  import {
    handleShortcutKeydown,
    registerShortcuts,
  } from "$lib/states/shortcutsState.svelte";
  import { toggleMode } from "mode-watcher";
  import ShortcutsHelpDialog from "$lib/features/shortcuts/ShortcutsHelpDialog.svelte";
  import * as Tooltip from "$lib/ui/shadcn/tooltip/index.js";
  import { openShortcutsHelpDialog } from "$lib/states/shortcutsHelpState.svelte";

  registerShortcuts({
    id: "global",
    label: "Global",
    shortcuts: [
      {
        combo: "Alt+S",
        description: "Toggle dark/light theme",
        handler: () => toggleMode(),
        options: { allowInInputs: true },
      },
      {
        combo: "Ctrl+/",
        description: "Open keyboard shortcuts help",
        handler: openShortcutsHelpDialog,
        options: { allowInInputs: true },
      },
    ],
  });

  onMount(async () => {
    await closeKvStore();
    await loadSettings();
    if (settingsState.autoCheckForUpdate) {
      startCheckingForUpdates();
    }

    document.addEventListener("keydown", handleShortcutKeydown);
  });

  onDestroy(() => {
    document.removeEventListener("keydown", handleShortcutKeydown);
  });
</script>

<main class="w-full mx-auto p-3 flex flex-col h-screen overflow-hidden">
  <Tooltip.Provider delayDuration={0} disabled={metadata.environment == "testing"}>
    <Header />
    <div class="flex-1 min-h-0">
      {#if kvStoresState.openedStore}
        <KvEntriesBrowser />
      {:else}
        <KvStoresManagement />
      {/if}
    </div>
  </Tooltip.Provider>
  <Toaster richColors duration={metadata.environment == "testing" ? 1 : undefined} />
  <ShortcutsHelpDialog />
  <ModeWatcher />
  <LoadingOverlay />
</main>

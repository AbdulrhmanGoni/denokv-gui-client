<script lang="ts">
  import { ModeWatcher } from "mode-watcher";
  import { kvStoresState } from "$lib/states/kvStoresState.svelte";
  import Header from "$lib/layout/Header.svelte";
  import KvEntriesBrowser from "$lib/features/kv-browser/KvEntriesBrowser.svelte";
  import KvStoresManagement from "$lib/features/kv-stores/KvStoresManagement.svelte";
  import { Toaster } from "$lib/ui/shadcn/sonner";
  import LoadingOverlay from "$lib/ui/primitives/LoadingOverlay.svelte";
  import { metadata } from "@app/preload";
  import {
    loadSettings,
    settingsState,
  } from "$lib/states/settingsState.svelte";
  import { onMount } from "svelte";
  import { startCheckingForUpdates } from "$lib/states/appUpdate.svelte";
  import { handleKeyboardShortcuts } from "$lib/helpers/keyboardShortcuts";
  import * as Tooltip from "$lib/ui/shadcn/tooltip/index.js";

  onMount(async () => {
    await loadSettings();
    if (settingsState.autoCheckForUpdate) {
      startCheckingForUpdates();
    }

    document.addEventListener("keydown", handleKeyboardShortcuts);
  });
</script>

<main
  class="max-w-7xl w-full mx-auto px-3 flex flex-col min-h-screen justify-center"
>
  <Tooltip.Provider
    delayDuration={0}
    disabled={metadata.environment == "testing"}
  >
    <Header />
    <div class="h-[600px]">
      {#if kvStoresState.openedStore}
        <KvEntriesBrowser />
      {:else}
        <KvStoresManagement />
      {/if}
    </div>
  </Tooltip.Provider>
  <Toaster
    richColors
    duration={metadata.environment == "testing" ? 1 : undefined}
  />
  <ModeWatcher />
  <LoadingOverlay />
</main>

<script lang="ts">
  import { ModeWatcher } from "mode-watcher";
  import { kvStoresState } from "$lib/states/kvStoresState.svelte";
  import Header from "$lib/components/custom/Header.svelte";
  import EntitiesBrowser from "$lib/components/Browser/EntitiesBrowser.svelte";
  import KvStoresManagement from "$lib/components/Stores/KvStoresManagement.svelte";
  import { Toaster } from "$lib/components/shadcn/sonner";
  import LoadingOverlay from "$lib/components/custom/LoadingOverlay.svelte";
  import { globalState } from "$lib/states/globalState.svelte";
  import Settings from "$lib/components/Settings/Settings.svelte";
</script>

<main
  class="max-w-7xl w-full mx-auto px-3 flex flex-col min-h-screen justify-center"
>
  <Header />
  <div class="h-[600px]">
    {#if globalState.openSettings}
      <Settings />
    {:else if kvStoresState.openedStore}
      <EntitiesBrowser />
    {:else}
      <KvStoresManagement />
    {/if}
  </div>
  <Toaster richColors />
  <ModeWatcher />
  <LoadingOverlay />
</main>

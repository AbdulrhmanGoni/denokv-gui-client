<script lang="ts">
  import { ModeWatcher } from "mode-watcher";
  import { kvStoresState } from "$lib/states/kvStoresState.svelte";
  import Header from "$lib/layout/Header.svelte";
  import EntitiesBrowser from "$lib/features/kv-browser/EntitiesBrowser.svelte";
  import KvStoresManagement from "$lib/features/kv-stores/KvStoresManagement.svelte";
  import { Toaster } from "$lib/ui/shadcn/sonner";
  import LoadingOverlay from "$lib/ui/primitives/LoadingOverlay.svelte";
  import { environment } from "@app/preload";
</script>

<main
  class="max-w-7xl w-full mx-auto px-3 flex flex-col min-h-screen justify-center"
>
  <Header />
  <div class="h-[600px]">
    {#if kvStoresState.openedStore}
      <EntitiesBrowser />
    {:else}
      <KvStoresManagement />
    {/if}
  </div>
  <Toaster richColors duration={environment == "testing" ? 1 : undefined} />
  <ModeWatcher />
  <LoadingOverlay />
</main>

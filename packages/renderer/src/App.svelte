<script lang="ts">
  import { ModeWatcher } from "mode-watcher";
  import { Toaster } from "$lib/components/shadcn/sonner";
  import LoadingOverlay from "$lib/components/custom/LoadingOverlay.svelte";
</script>

<main
  class="max-w-7xl w-full mx-auto px-3 flex flex-col h-screen justify-center"
>
  <Toaster richColors />
  <ModeWatcher />
  <LoadingOverlay />
</main>

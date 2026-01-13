<script lang="ts">
  import { globalState } from "$lib/states/globalState.svelte";
  import LoaderIcon from "@lucide/svelte/icons/loader";
</script>

{#if globalState.loadingOverlay.open}
  <dialog
    open={true}
    class="bg-black/30 flex flex-col gap-2 justify-center items-center h-screen top-0 left-0 w-full z-100"
  >
    {globalState.loadingOverlay.text}
    <LoaderIcon class="animate-spin" />
  </dialog>
{/if}

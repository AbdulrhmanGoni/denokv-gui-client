<script lang="ts">
  import { globalState } from "$lib/globalState.svelte";
  import LoaderIcon from "@lucide/svelte/icons/loader";
</script>

{#if globalState.openLoadingOverlay}
  <dialog
    open={true}
    class="bg-black/30 flex justify-center items-center h-screen top-0 left-0 w-full z-100"
  >
    <LoaderIcon class="animate-spin" />
  </dialog>
{/if}

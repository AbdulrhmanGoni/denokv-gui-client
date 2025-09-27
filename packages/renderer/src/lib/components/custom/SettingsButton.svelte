<script lang="ts">
    import Button from "$lib/components/shadcn/button/button.svelte";
    import { globalState, updateState } from "$lib/globalState.svelte";
    import SettingsIcon from "@lucide/svelte/icons/settings";
    import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
</script>

<Button
    variant="outline"
    size="icon"
    class="p-1.5 size-10 cursor-pointer relative"
    onclick={() => {
        globalState.openSettings = !globalState.openSettings;
    }}
>
    {#if globalState.openSettings}
        <ArrowLeftIcon class="text-foreground size-6" />
    {:else}
        {#if updateState.newUpdate?.isUpdateAvailable}
            <div
                class="!size-2 bg-red-500 rounded-full absolute right-1 top-1"
            ></div>
        {/if}
        <SettingsIcon class="text-foreground size-6" />
    {/if}
</Button>

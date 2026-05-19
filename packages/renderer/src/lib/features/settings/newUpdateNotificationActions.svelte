<script lang="ts">
    import { updateAppState } from "$lib/states/appUpdate.svelte";
    import { openSettingsPage } from "$lib/states/settingsState.svelte";
    import Button from "$lib/ui/shadcn/button/button.svelte";
    import NotesIcon from "@lucide/svelte/icons/notepad-text";
    import DownloadIcon from "@lucide/svelte/icons/download";
    import { startDownloadingUpdate } from "$lib/states/appUpdate.svelte";
    const buttonClasses = "px-1.5 py-1 h-fit text-xs! rounded-sm items-start";

    const { dismiss }: { dismiss: () => void } = $props();
</script>

<div class="flex gap-1.5 mt-1 items-center w-full flex-1">
    <Button
        variant="outline"
        size="sm"
        class={buttonClasses}
        onclick={() => {
            openSettingsPage();
            updateAppState.openReleaseNotes = true;
            dismiss();
        }}
    >
        See What's New
        <NotesIcon class="size-3.5" />
    </Button>
    <Button
        variant="secondary"
        size="sm"
        class={buttonClasses}
        onclick={() => {
            openSettingsPage();
            startDownloadingUpdate();
            dismiss();
        }}
    >
        Download
        <DownloadIcon class="size-3.5" />
    </Button>
</div>

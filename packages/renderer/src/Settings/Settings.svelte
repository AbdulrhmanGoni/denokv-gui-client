<script lang="ts">
    import SwitchThemeButton from "$lib/components/custom/SwitchThemeButton.svelte";
    import Separator from "$lib/components/shadcn/separator/separator.svelte";
    import PaletteIcon from "@lucide/svelte/icons/palette";
    import SettingsIcon from "@lucide/svelte/icons/settings";
</script>

<div class="gap-3 flex flex-col h-full rounded-md border p-3">
    <h1 class="text-3xl font-bold flex gap-2 items-center my-1">
        <SettingsIcon class="size-7.5" />
        Settings
    </h1>
    <Separator />
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div class="space-y-4">
            <h3 class="font-semibold text-xl flex gap-2 items-center">
                <PaletteIcon />
                Theme
            </h3>
            <SwitchThemeButton />
        </div>
    </div>
</div>

<script lang="ts">
    import UpdateAppSetting from "$lib/components/Settings/UpdateAppSetting.svelte";
    import AppThemeSetting from "$lib/components/Settings/AppThemeSetting.svelte";
    import Separator from "$lib/components/shadcn/separator/separator.svelte";
    import SettingsIcon from "@lucide/svelte/icons/settings";
</script>

<div class="gap-3 flex flex-col h-full rounded-md border p-3">
    <h1 class="text-3xl font-bold flex gap-2 items-center my-1">
        <SettingsIcon class="size-7.5" />
        Settings
    </h1>
    <Separator />
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <UpdateAppSetting />
        <AppThemeSetting />
    </div>
</div>

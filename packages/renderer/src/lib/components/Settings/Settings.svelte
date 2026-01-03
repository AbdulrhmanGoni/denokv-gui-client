<script lang="ts">
    import UpdateAppSetting from "$lib/components/Settings/UpdateAppSetting.svelte";
    import AppThemeSetting from "$lib/components/Settings/AppThemeSetting.svelte";
    import Separator from "$lib/components/shadcn/separator/separator.svelte";
    import SettingsIcon from "@lucide/svelte/icons/settings";
    import * as Dialog from "$lib/components/shadcn/dialog/index.js";
    import { cn } from "$lib/shadcn-utils";
    import { buttonVariants } from "../shadcn/button";
</script>

<Dialog.Root>
    <Dialog.Trigger
        class={cn(
            buttonVariants({
                class: "p-1.5 size-10 cursor-pointer relative",
                size: "icon",
                variant: "outline",
            }),
        )}
    >
        <SettingsIcon class="text-foreground size-6" />
    </Dialog.Trigger>
    <Dialog.Content class="max-h-[600px]! h-full max-w-6xl! w-full p-3">
        <div class="flex flex-col gap-3">
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
    </Dialog.Content>
</Dialog.Root>

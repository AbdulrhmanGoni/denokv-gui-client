<script lang="ts">
    import {
        isSelectedKey,
        isUpdatedRecently,
        toggleSelectedKey,
        unwatchKvEntries,
    } from "$lib/states/watchedKvEntriesState.svelte";
    import Separator from "$lib/ui/shadcn/separator/separator.svelte";
    import CopyKvEntry from "../actions/CopyKvEntry.svelte";
    import KvKeyRenderer from "../entry-renderer/KvKeyRenderer.svelte";
    import EyeOffIcon from "@lucide/svelte/icons/eye-off";
    import FileBraces from "@lucide/svelte/icons/file-braces";
    import KeyRoundIcon from "@lucide/svelte/icons/key-round";
    import TagsIcon from "@lucide/svelte/icons/tags";
    import KvValueRenderer from "../entry-renderer/KvValueRenderer.svelte";
    import Checkbox from "$lib/ui/shadcn/checkbox/checkbox.svelte";
    import Button from "$lib/ui/shadcn/button/button.svelte";

    let { entry }: { entry: KvEntry } = $props();

    let checked = $derived.by(() => isSelectedKey(entry.key));
</script>

<div
    class="flex flex-col ease-in-out {isUpdatedRecently(entry)
        ? 'bg-muted'
        : 'bg-card'}
    rounded-md border {checked ? 'border-foreground' : ''}
    p-2 text-sm"
>
    <div class="flex flex-col gap-1 flex-1 overflow-hidden">
        <div class="flex items-center gap-2 rounded-t-sm">
            <p class="flex gap-2 items-center font-bold">
                <KeyRoundIcon class="size-4 rotate-270" /> Key:
            </p>
            <KvKeyRenderer key={entry.key} />
            <CopyKvEntry target="key" {entry} className="ml-auto" />
        </div>
        <div class="flex gap-2 items-center font-bold">
            <TagsIcon class="size-4" /> Versionstamp:
            <span class="font-normal flex-1">{entry.versionstamp}</span>
            <CopyKvEntry target="Versionstamp" {entry} />
        </div>
        <div class="flex items-center gap-2 rounded-b-sm">
            <p class="flex gap-2 items-center font-bold">
                <FileBraces class="size-4" /> Value:
            </p>
            <KvValueRenderer value={entry.value} />
            <CopyKvEntry target="Value" {entry} className="ml-auto" />
        </div>
    </div>
    <Separator class="my-2" />
    <div class="flex items-center justify-between">
        <Checkbox
            bind:checked
            onCheckedChange={(c) => toggleSelectedKey(entry.key, !c)}
            class="cursor-pointer"
        />
        <Button
            variant="outline"
            size="sm"
            class="h-fit! px-1.5! py-0.5 text-destructive!"
            onclick={() => unwatchKvEntries([entry])}
        >
            <EyeOffIcon class="size-4 shrink-0" />
            Unwatch
        </Button>
    </div>
</div>

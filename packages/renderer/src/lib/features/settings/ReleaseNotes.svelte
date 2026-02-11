<script lang="ts">
    import * as Dialog from "$lib/ui/shadcn/dialog/index.js";
    import Separator from "$lib/ui/shadcn/separator/separator.svelte";
    import NotesIcon from "@lucide/svelte/icons/notepad-text";
    import XIcon from "@lucide/svelte/icons/x";
    import { buttonVariants } from "$lib/ui/shadcn/button";

    const { newUpdate }: { newUpdate: UpdateCheckResult } = $props();
</script>

{#if newUpdate.updateInfo.releaseNotes}
    <Dialog.Root>
        <Dialog.Trigger
            class={buttonVariants({ size: "sm", variant: "outline" })}
        >
            See Release Notes
            <NotesIcon class="size-4" />
        </Dialog.Trigger>
        <Dialog.Content class="max-w-3xl! w-full py-1.5 px-3 gap-0">
            <h1 class="flex items-center gap-2 text-2xl font-bold">
                <NotesIcon class="size-6" />
                Release Notes
            </h1>
            <p class="text-muted-foreground">
                See that changes you are going to get with this update
            </p>
            <Separator class="my-2" />
            <div id="release-notes" class="max-h-[500px] overflow-auto">
                {#if typeof newUpdate.updateInfo.releaseNotes == "string"}
                    {@render ReleaseNotes(
                        newUpdate.updateInfo.version,
                        newUpdate.updateInfo.releaseNotes,
                        true,
                    )}
                {:else}
                    <div>
                        {#each newUpdate.updateInfo.releaseNotes as release, i}
                            <div>
                                {@render ReleaseNotes(
                                    release.version,
                                    release.note,
                                    newUpdate.updateInfo.version ==
                                        release.version,
                                )}
                            </div>
                            {#if i < newUpdate.updateInfo.releaseNotes.length - 1}
                                <Separator class="my-3" />
                            {/if}
                        {/each}
                    </div>
                {/if}
            </div>
        </Dialog.Content>
    </Dialog.Root>
{/if}

{#snippet ReleaseNotes(
    version: string,
    notes: string | null,
    isLatest: boolean,
)}
    <h2 class="flex gap-1.5 items-center text-2xl mb-2 font-extrabold">
        v{version}
        {#if isLatest}
            <span class="text-base text-blue-600 dark:text-blue-500 font-bold">
                (latest)
            </span>
        {/if}
    </h2>
    {@html notes?.replaceAll("<a href=", '<a target="_blank" href=')}
{/snippet}

<style>
    #release-notes :global {
        h3 {
            font-size: 20px;
            font-weight: 700;
            margin: 0 0 5px 0;
        }

        ul {
            list-style-type: disc;
            margin: 0 0 16px 28px;
        }

        li {
            margin-bottom: 4px;
        }

        a {
            text-decoration: underline;
            text-underline-offset: 2px;
        }

        a:hover {
            opacity: 0.8;
        }
    }
</style>

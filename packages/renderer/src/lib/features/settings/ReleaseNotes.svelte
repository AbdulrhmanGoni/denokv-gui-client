<script lang="ts">
    import * as AlertDialog from "$lib/ui/shadcn/alert-dialog/index.js";
    import Separator from "$lib/ui/shadcn/separator/separator.svelte";
    import NotesIcon from "@lucide/svelte/icons/notepad-text";
    import XIcon from "@lucide/svelte/icons/x";
    import { buttonVariants } from "$lib/ui/shadcn/button";

    const { newUpdate }: { newUpdate: UpdateCheckResult } = $props();
</script>

{#if newUpdate.updateInfo.releaseNotes}
    <AlertDialog.Root>
        <AlertDialog.Trigger
            class={buttonVariants({ size: "sm", variant: "outline" })}
        >
            See Release Notes
            <NotesIcon class="size-4" />
        </AlertDialog.Trigger>
        <AlertDialog.Content class="max-w-3xl! w-full p-3 gap-0">
            <h1 class="flex items-center gap-2 text-2xl font-bold">
                <NotesIcon class="size-6" />
                Release Notes
                <AlertDialog.Cancel
                    class="ms-auto bg-transparent! w-fit border-0 p-1!"
                >
                    <XIcon class="size-5" />
                </AlertDialog.Cancel>
            </h1>
            <Separator class="my-3" />
            <div id="release-notes" class="max-h-[600px] overflow-auto">
                {#if typeof newUpdate.updateInfo.releaseNotes == "string"}
                    {@render ReleaseNotes(
                        newUpdate.updateInfo.version,
                        newUpdate.updateInfo.releaseNotes,
                    )}
                {:else}
                    <div class="space-y-6">
                        {#each newUpdate.updateInfo.releaseNotes as release}
                            <div>
                                {@render ReleaseNotes(
                                    release.version,
                                    release.note,
                                )}
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>
        </AlertDialog.Content>
    </AlertDialog.Root>
{/if}

{#snippet ReleaseNotes(version: string, notes: string | null)}
    <h2 class="flex gap-1.5 items-center text-2xl mb-2 font-extrabold">
        v{version}
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

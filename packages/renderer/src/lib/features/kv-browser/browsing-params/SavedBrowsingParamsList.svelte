<script lang="ts">
    import Separator from "$lib/ui/shadcn/separator/separator.svelte";
    import BookMarkedIcon from "@lucide/svelte/icons/book-marked";
    import BookAlertIcon from "@lucide/svelte/icons/book-alert";
    import BookXIcon from "@lucide/svelte/icons/book-x";
    import SavedBrowsingParamsCard from "$lib/features/kv-browser/browsing-params/SavedBrowsingParamsCard.svelte";
    import {
        fetchSavedBrowsingParams,
        savedBrowsingParamsState,
    } from "$lib/states/kvEntriesState.svelte";
    import EditSavedBrowsingParamsForm from "./EditSavedBrowsingParamsForm.svelte";
    import Button from "$lib/ui/shadcn/button/button.svelte";
    import ArrowLeft from "@lucide/svelte/icons/arrow-left";
    import { onMount } from "svelte";

    const { closeList }: { closeList: (closeDialog?: boolean) => void } =
        $props();

    onMount(fetchSavedBrowsingParams);
</script>

<h1 class="flex gap-2 items-center text-2xl font-bold">
    <BookMarkedIcon />
    Saved Filters
</h1>
{#if savedBrowsingParamsState.selectedParamsToEdit}
    <EditSavedBrowsingParamsForm
        savedBrowsingParamsRecord={savedBrowsingParamsState.selectedParamsToEdit}
    />
{:else}
    <p class="gap-1.5 text-muted-foreground">
        You will see here all filters you have saved
    </p>
    <Separator />
    {#if savedBrowsingParamsState.savedParams.length > 0}
        <div class="flex gap-2 mt-2">
            {@render backButtom()}
        </div>
    {/if}
    <div class="flex flex-col w-full gap-2 overflow-auto max-h-96 pe-0.5">
        {#if savedBrowsingParamsState.error}
            <div class="flex flex-col py-6 items-center gap-1">
                <BookXIcon class="size-9" />
                <p class="text-center text-lg text-destructive">
                    {savedBrowsingParamsState.error}
                </p>
            </div>
        {:else}
            {#each savedBrowsingParamsState.savedParams as browsingParamsRecord (browsingParamsRecord.id)}
                <SavedBrowsingParamsCard {browsingParamsRecord} {closeList} />
            {:else}
                <div class="flex flex-col py-6 items-center gap-1">
                    <BookAlertIcon class="size-9" />
                    <p class="text-center text-lg">
                        No Saved filters for this KV store
                    </p>
                    {@render backButtom("mt-2")}
                </div>
            {/each}
        {/if}
    </div>
{/if}

{#snippet backButtom(className?: string)}
    <Button
        class={className}
        variant="outline"
        size="sm"
        onclick={() => closeList()}
    >
        <ArrowLeft />
        Back
    </Button>
{/snippet}

<script lang="ts">
    import * as AlertDialog from "$lib/components/shadcn/alert-dialog/index.js";
    import Separator from "$lib/components/shadcn/separator/separator.svelte";
    import BookMarkedIcon from "@lucide/svelte/icons/book-marked";
    import XIcon from "@lucide/svelte/icons/x";
    import BookAlertIcon from "@lucide/svelte/icons/book-alert";
    import BookXIcon from "@lucide/svelte/icons/book-x";
    import ButtonWithTooltip from "../custom/ButtonWithTooltip.svelte";
    import SavedBrowsingParamsCard from "./SavedBrowsingParamsCard.svelte";
    import {
        fetchSavedBrowsingParams,
        savedBrowsingParamsState,
    } from "$lib/states/kvEntriesState.svelte";
    import EditSavedBrowsingParamsForm from "./EditSavedBrowsingParamsForm.svelte";

    let openBrowseParamsForm = $state(false);

    function getOpen() {
        return openBrowseParamsForm;
    }

    function setOpen(newOpen: boolean) {
        openBrowseParamsForm = newOpen;
    }

    function closeList() {
        setOpen(false);
    }
</script>

<AlertDialog.Root bind:open={getOpen, setOpen}>
    <AlertDialog.Trigger>
        <ButtonWithTooltip
            size="sm"
            tooltipContent="Saved Filters"
            onclick={() => {
                setOpen(true);
                fetchSavedBrowsingParams();
            }}
        >
            <BookMarkedIcon class="size-5" />
        </ButtonWithTooltip>
    </AlertDialog.Trigger>
    <AlertDialog.Content class="!max-w-xl w-full p-3 gap-2">
        <h1 class="flex gap-2 items-center text-2xl font-bold mb-">
            <BookMarkedIcon />
            Saved Filters
            <button onclick={closeList} class="ms-auto cursor-pointer">
                <XIcon class="size-5" />
            </button>
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
            <div
                class="flex flex-col w-full gap-2 mt-2 overflow-auto max-h-96 pe-0.5"
            >
                {#if savedBrowsingParamsState.error}
                    <div class="flex flex-col py-6 items-center gap-1">
                        <BookXIcon class="size-9" />
                        <p class="text-center text-lg text-destructive">
                            {savedBrowsingParamsState.error}
                        </p>
                    </div>
                {:else}
                    {#each savedBrowsingParamsState.savedParams as browsingParamsRecord (browsingParamsRecord.id)}
                        <SavedBrowsingParamsCard
                            {browsingParamsRecord}
                            {closeList}
                        />
                    {:else}
                        <div class="flex flex-col py-6 items-center gap-1">
                            <BookAlertIcon class="size-9" />
                            <p class="text-center text-lg">
                                No Saved filters for this KV store
                            </p>
                        </div>
                    {/each}
                {/if}
            </div>
        {/if}
    </AlertDialog.Content>
</AlertDialog.Root>

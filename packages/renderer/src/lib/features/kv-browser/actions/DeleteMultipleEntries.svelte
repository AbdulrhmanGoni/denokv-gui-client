<script lang="ts">
    import type { Row } from "@tanstack/table-core";
    import * as AlertDialog from "$lib/ui/shadcn/alert-dialog/index.js";
    import { deleteKvEntry } from "$lib/helpers/deleteKvEntry.svelte";
    import { toast } from "svelte-sonner";
    import LoaderIcon from "@lucide/svelte/icons/loader";
    import XIcon from "@lucide/svelte/icons/x";
    import Button, {
        buttonVariants,
    } from "$lib/ui/shadcn/button/button.svelte";

    const { selectedRows }: { selectedRows: Row<SerializedKvEntry>[] } =
        $props();

    let successfullyDeletedEntries = $state(0);
    let entriesToDeletedCount = $state(0);
    let isDeleting = $state(false);
    let isCanceled = $state(false);

    async function deleteEntries() {
        isDeleting = true;
        successfullyDeletedEntries = 0;
        entriesToDeletedCount = selectedRows.length;

        const rowsToDelete = selectedRows;

        new Promise<void>(async (resolve) => {
            for (let i = 0; i < rowsToDelete.length; i++) {
                if (isCanceled) break;

                const entry = rowsToDelete[i].original;
                await deleteKvEntry(entry, {
                    onSuccess() {
                        successfullyDeletedEntries++;
                    },
                });
            }

            if (rowsToDelete.length == successfullyDeletedEntries) {
                toast.success("All selected entries were deleted successfully");
            } else {
                toast.info(
                    `${successfullyDeletedEntries} of ${rowsToDelete.length} entries 
                    ${successfullyDeletedEntries > 1 ? "were" : "was"} deleted successfully`,
                );
            }

            isDeleting = false;
            successfullyDeletedEntries = 0;
            entriesToDeletedCount = 0;
            isCanceled = false;

            resolve();
        });

        setOpen(false);
    }

    let open = $state(false);

    function onCancel() {
        if (!isCanceled) {
            isCanceled = true;
        } else {
            setOpen(false);
        }
    }

    function getOpen() {
        return open;
    }

    function setOpen(state: boolean) {
        open = state;
    }
</script>

<AlertDialog.Root bind:open={getOpen, setOpen}>
    <AlertDialog.Trigger
        onclick={(e) => e.stopPropagation()}
        class={buttonVariants({ size: "sm", variant: "destructive" })}
        disabled={isDeleting}
    >
        {#if isDeleting}
            <LoaderIcon class="animate-spin size-4" />
            <p class="flex gap-1.5 items-center">
                {isCanceled
                    ? "Canceling..."
                    : `Deleting... (${successfullyDeletedEntries}/${entriesToDeletedCount})`}
            </p>
        {:else}
            Delete {selectedRows.length} key{selectedRows.length > 1 ? "s" : ""}
        {/if}
    </AlertDialog.Trigger>
    <AlertDialog.Content>
        <AlertDialog.Header>
            <AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
            <AlertDialog.Description>
                This will permanently delete all selected Kv Entries and you
                won't be able to undo this action.
            </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
            <Button variant="outline" onclick={onCancel}>Cancel</Button>
            <AlertDialog.Action
                class={buttonVariants({ variant: "destructive" })}
                disabled={isDeleting}
                onclick={deleteEntries}
            >
                Delete
            </AlertDialog.Action>
        </AlertDialog.Footer>
    </AlertDialog.Content>
</AlertDialog.Root>
{#if isDeleting && !isCanceled}
    <button class="cursor-pointer" onclick={onCancel}>
        <XIcon class="size-5" />
    </button>
{/if}

<script lang="ts">
    import TrashIcon from "@lucide/svelte/icons/trash";
    import * as AlertDialog from "$lib/ui/shadcn/alert-dialog/index.js";
    import { browsingParamsService } from "@app/preload";
    import { savedBrowsingParamsState } from "$lib/states/kvEntriesState.svelte";
    import { toast } from "svelte-sonner";
    import { buttonVariants } from "$lib/ui/shadcn/button/button.svelte";
    import { cn } from "$lib/shadcn-utils";

    const {
        browsingParamsRecord,
    }: {
        browsingParamsRecord: SavedBrowsingParamsRecord<SavedBrowsingParams>;
    } = $props();

    let openDialog = $state(false);

    function getOpen() {
        return openDialog;
    }

    function setOpen(newOpen: boolean) {
        openDialog = newOpen;
    }

    function deleteSavedBrowsingParams() {
        const { result, error } =
            browsingParamsService.deleteSavedBrowsingParams(
                browsingParamsRecord.id,
            );

        if (result) {
            toast.success(
                "The saved browsing params were deleted successfully",
            );
            savedBrowsingParamsState.savedParams =
                savedBrowsingParamsState.savedParams.filter(
                    (record) => record.id != browsingParamsRecord.id,
                );
            openDialog = false;
        } else {
            toast.error(error);
        }
    }
</script>

<AlertDialog.Root bind:open={getOpen, setOpen}>
    <AlertDialog.Trigger
        class={cn(buttonVariants({ size: "icon", variant: "destructive" }))}
    >
        <TrashIcon />
    </AlertDialog.Trigger>
    <AlertDialog.Content>
        <AlertDialog.Header>
            <AlertDialog.Title>Are you sure?</AlertDialog.Title>
            <AlertDialog.Description>
                This will permanently delete these saved browsing parameters.
                You won't be able to undo this action.
            </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
            <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
            <AlertDialog.Action
                class="bg-destructive hover:bg-destructive/85 text-white"
                onclick={deleteSavedBrowsingParams}
            >
                Delete
            </AlertDialog.Action>
        </AlertDialog.Footer>
    </AlertDialog.Content>
</AlertDialog.Root>

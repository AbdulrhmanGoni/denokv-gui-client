<script lang="ts">
    import {
        kvEntriesStateDefaultValues,
        savedBrowsingParamsState,
    } from "$lib/states/kvEntriesState.svelte";
    import Button from "$lib/ui/shadcn/button/button.svelte";
    import SaveFilterIcon from "@lucide/svelte/icons/save";
    import XIcon from "@lucide/svelte/icons/x";
    import BrowseParamsForm from "$lib/features/kv-browser/browsing-params/BrowsingParamsForm.svelte";
    import { toast } from "svelte-sonner";
    import { kvStoresState } from "$lib/states/kvStoresState.svelte";
    import { browsingParamsService } from "@app/preload";

    type Props = {
        savedBrowsingParamsRecord: SavedBrowsingParamsRecord<SavedBrowsingParams>;
    };

    const { savedBrowsingParamsRecord }: Props = $props();

    let prefix = $state(savedBrowsingParamsRecord.paramsAsJson.prefix);
    let start = $state(savedBrowsingParamsRecord.paramsAsJson.start);
    let end = $state(savedBrowsingParamsRecord.paramsAsJson.end);
    let limit = $state(savedBrowsingParamsRecord.paramsAsJson.limit);
    let consistency = $state(
        savedBrowsingParamsRecord.paramsAsJson.consistency ??
            kvEntriesStateDefaultValues.params.consistency,
    );
    let batchSize = $state(
        savedBrowsingParamsRecord.paramsAsJson.batchSize ??
            kvEntriesStateDefaultValues.params.batchSize,
    );
    let reverse = $state(
        savedBrowsingParamsRecord.paramsAsJson.reverse ??
            kvEntriesStateDefaultValues.params.reverse,
    );

    async function saveUpdate() {
        if (kvStoresState.openedStore) {
            const newBrowsingParams = {
                end,
                limit,
                prefix,
                start,
                batchSize,
                consistency,
                reverse,
            };
            const { result, error } =
                await browsingParamsService.updateSavedBrowsingParams(
                    kvStoresState.openedStore.id,
                    savedBrowsingParamsRecord.id,
                    { newBrowsingParams },
                );

            if (result) {
                toast.success("The browsing params were updated successfully");
                savedBrowsingParamsState.savedParams =
                    savedBrowsingParamsState.savedParams.map((record) => {
                        if (record.id == savedBrowsingParamsRecord.id) {
                            record.paramsAsJson = newBrowsingParams;
                        }
                        return record;
                    });
                closeForm();
            } else {
                toast.error(error);
            }
        }
    }

    function closeForm() {
        savedBrowsingParamsState.selectedParamsToEdit = null;
    }
</script>

<BrowseParamsForm
    bind:prefix
    bind:start
    bind:end
    bind:limit
    bind:batchSize
    bind:consistency
    bind:reverse
>
    <div class="flex flex-row-reverse gap-2">
        <Button onclick={saveUpdate} size="sm">
            Save
            <SaveFilterIcon />
        </Button>
        <Button variant="outline" size="sm" onclick={closeForm}>
            Cancel
            <XIcon />
        </Button>
    </div>
</BrowseParamsForm>

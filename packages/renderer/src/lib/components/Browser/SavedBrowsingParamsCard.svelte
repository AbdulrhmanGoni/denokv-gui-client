<script lang="ts">
    import Separator from "$lib/components/shadcn/separator/separator.svelte";
    import EditIcon from "@lucide/svelte/icons/square-pen";
    import CheckIcon from "@lucide/svelte/icons/check";
    import CodeRenderer from "./CodeRenderer.svelte";
    import ButtonWithTooltip from "../custom/ButtonWithTooltip.svelte";
    import DeleteSavedBrowsingParamsButton from "./DeleteSavedBrowsingParamsButton.svelte";
    import { browsingParamsService } from "@app/preload";
    import dataTypesColors from "./dataTypesColors";
    import Button from "../shadcn/button/button.svelte";
    import {
        savedBrowsingParamsState,
        setBrowsingParams,
        setDefaultBrowsingParams,
    } from "$lib/states/kvEntriesState.svelte";
    import { toast } from "svelte-sonner";
    import { kvStoresState } from "$lib/states/kvStoresState.svelte";

    type Props = {
        browsingParamsRecord: SavedBrowsingParamsRecord<SavedBrowsingParams>;
        closeList: () => void;
    };

    const { browsingParamsRecord, closeList }: Props = $props();

    function setSavedBrowsingParamsAsTheDefault(setAsDefault: boolean) {
        if (kvStoresState.openedStore) {
            const { result, error } =
                browsingParamsService.updateSavedBrowsingParams(
                    kvStoresState.openedStore.id,
                    browsingParamsRecord.id,
                    { setAsDefault },
                );

            if (result) {
                toast.success(
                    `The saved browsing params were ${setAsDefault ? "set" : "unset"} as the default successfully`,
                );
                savedBrowsingParamsState.savedParams =
                    savedBrowsingParamsState.savedParams.map((record) => {
                        if (record.id == browsingParamsRecord.id) {
                            record.isDefault = setAsDefault ? 1 : 0;
                            setDefaultBrowsingParams(
                                record.isDefault
                                    ? browsingParamsRecord.paramsAsJson
                                    : undefined,
                            );
                        } else {
                            record.isDefault = 0;
                        }
                        return record;
                    });
            } else {
                toast.error(error);
            }
        }
    }
</script>

<div class="p-2 flex flex-col gap-1.5 bg-card rounded-sm">
    <div class="flex gap-1 items-center font-bold px-2">
        <p>Prefix:</p>
        <CodeRenderer code={browsingParamsRecord.paramsAsJson.prefix} />
    </div>
    <div class="flex gap-1 items-center font-bold px-2">
        <p>Start:</p>
        <CodeRenderer code={browsingParamsRecord.paramsAsJson.start} />
    </div>
    <div class="flex gap-1 items-center font-bold px-2">
        <p>End:</p>
        <CodeRenderer code={browsingParamsRecord.paramsAsJson.end} />
    </div>
    <div class="flex gap-1 items-center font-bold px-2">
        <p>Limit:</p>
        <span class={dataTypesColors.number}>
            {browsingParamsRecord.paramsAsJson.limit}
        </span>
    </div>
    <Separator />
    <div class="flex gap-2 justify-end">
        <Button
            size="sm"
            variant={browsingParamsRecord.isDefault ? "outline" : "default"}
            onclick={() =>
                setSavedBrowsingParamsAsTheDefault(
                    !browsingParamsRecord.isDefault,
                )}
        >
            {#if browsingParamsRecord.isDefault}
                default
                <CheckIcon />
            {:else}
                Set as default
            {/if}
        </Button>
        <Button
            variant="secondary"
            size="sm"
            class="me-auto"
            onclick={() => {
                setBrowsingParams(browsingParamsRecord.paramsAsJson);
                closeList();
            }}
        >
            Apply
        </Button>
        <DeleteSavedBrowsingParamsButton {browsingParamsRecord} />
        <ButtonWithTooltip
            variant="secondary2"
            tooltipContent="Edit"
            size="icon"
            onclick={() => {
                savedBrowsingParamsState.selectedParamsToEdit =
                    browsingParamsRecord;
            }}
        >
            <EditIcon />
        </ButtonWithTooltip>
    </div>
</div>

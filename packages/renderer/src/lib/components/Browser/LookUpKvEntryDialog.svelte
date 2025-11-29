<script lang="ts">
    import * as AlertDialog from "$lib/components/shadcn/alert-dialog/index.js";
    import Separator from "$lib/components/shadcn/separator/separator.svelte";
    import { kvClient } from "@app/preload";
    import { toast } from "svelte-sonner";
    import KvKeyEditor from "./KvKeyEditor.svelte";
    import Button from "$lib/components/shadcn/button/button.svelte";
    import SearchIcon from "@lucide/svelte/icons/search";
    import FileIcon from "@lucide/svelte/icons/file-plus";
    import LoaderIcon from "@lucide/svelte/icons/loader";
    import XIcon from "@lucide/svelte/icons/x";
    import {
        closeLookUpKeyDialog,
        openKvEntryDialog,
        openLookUpKeyDialogState,
    } from "$lib/states/kvEntryDialogState.svelte";

    let isLoading = $state(false);
    let kvKeyCodeEditor: KvKeyCodeEditor | undefined = $state();

    function getOpen() {
        return openLookUpKeyDialogState.open;
    }

    function setOpen(newOpen: boolean) {
        openLookUpKeyDialogState.open = newOpen;
    }

    async function searchForKey() {
        isLoading = true;
        const key = kvKeyCodeEditor!.toString();
        const { error, result } = await kvClient.get(key);

        if (result) {
            openKvEntryDialog(result);
        } else {
            toast.error("Look up failed", {
                description: error || "Unexpected Error!",
            });
        }

        isLoading = false;
    }
</script>

<AlertDialog.Root bind:open={getOpen, setOpen}>
    <AlertDialog.Content class="max-w-3xl! w-full p-3 gap-0">
        <h1 class="flex items-center gap-2 text-2xl font-bold">
            <FileIcon class="size-7" />
            Look Up KV Entry
        </h1>
        <p class="py-1.5">Search for an entry by it's key</p>
        <Separator class="my-3" />
        <KvKeyEditor bind:jar={kvKeyCodeEditor} />
        <Separator class="my-3" />
        <div class="flex flex-row-reverse gap-2">
            <Button
                disabled={isLoading}
                variant="default"
                size="sm"
                onclick={searchForKey}
            >
                Search
                {#if isLoading}
                    <LoaderIcon class="animate-spin" />
                {:else}
                    <SearchIcon />
                {/if}
            </Button>
            <Button
                disabled={isLoading}
                variant="outline"
                size="sm"
                onclick={closeLookUpKeyDialog}
            >
                <XIcon />
                Close
            </Button>
        </div>
    </AlertDialog.Content>
</AlertDialog.Root>

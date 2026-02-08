<script lang="ts">
    import KvEntryForm from "../entry-editor/KvEntryForm.svelte";
    import { addAtomicOperation } from "./atomicOperationsState.svelte";
    import FilePlusIcon from "@lucide/svelte/icons/file-plus";

    let { close }: { close?: () => void } = $props();

    async function addSetOperation(
        key: string,
        value: KvEntry["value"],
        expiresIn: number,
    ) {
        addAtomicOperation({
            name: "set",
            key,
            value,
            expiresIn: isNaN(expiresIn) ? undefined : expiresIn,
        });
        close?.();
    }
</script>

{#snippet header()}
    <div class="space-y-1">
        <h1 class="text-2xl font-bold flex gap-2 items-center">
            <FilePlusIcon class="size-7" />
            Set Operation
        </h1>
        <p class="text-muted-foreground">
            <strong>Add</strong> or <strong>Update</strong> a key-value entry in
            the KV store to the given value.
        </p>
    </div>
{/snippet}

<div class="sm:w-xl w-full bg-background rounded-lg">
    <KvEntryForm
        onSubmit={addSetOperation}
        onClose={close}
        {header}
        submitButtonLabel="Add Set Operation"
    />
</div>

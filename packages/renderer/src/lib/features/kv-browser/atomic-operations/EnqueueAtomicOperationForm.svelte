<script lang="ts">
    import EnqueueMessageForm from "../enqueue-message/EnqueueMessageForm.svelte";
    import { addAtomicOperation } from "./atomicOperationsState.svelte";

    let { close }: { close?: () => void } = $props();

    async function enqueue(
        message: KvEntry["value"],
        options?: EnqueueRequestInput["options"],
    ) {
        addAtomicOperation({
            name: "enqueue",
            value: message,
            options,
        });
        close?.();
    }
</script>

<div
    class="sm:w-xl w-md md:w-2xl bg-background overflow-auto p-3 gap-2 rounded-lg"
>
    <EnqueueMessageForm
        onSubmit={enqueue}
        submitButtonText="Add Enqueue Operation"
    />
</div>

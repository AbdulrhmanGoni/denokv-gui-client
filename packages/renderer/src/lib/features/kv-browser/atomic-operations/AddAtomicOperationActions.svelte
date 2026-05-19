<script lang="ts">
    import * as Dialog from "$lib/ui/shadcn/dialog/index.js";
    import Button from "$lib/ui/shadcn/button/button.svelte";
    import SetAtomicOperationForm from "./SetAtomicOperationForm.svelte";
    import CheckAtomicOperationForm from "./CheckAtomicOperationForm.svelte";
    import DeleteAtomicOperationForm from "./DeleteAtomicOperationForm.svelte";
    import EnqueueAtomicOperationForm from "./EnqueueAtomicOperationForm.svelte";
    import MinAtomicOperationForm from "./MinAtomicOperationForm.svelte";
    import MaxAtomicOperationForm from "./MaxAtomicOperationForm.svelte";
    import SumAtomicOperationForm from "./SumAtomicOperationForm.svelte";
    import { atomicOperationActions } from "./atomicOperationActions";

    let selectedOperation = $state("");

    let openAtomicOperationFormState = $state(false);
    const getOpenAtomicOperationForm = () => openAtomicOperationFormState;
    const setOpenAtomicOperationForm = (state: boolean) => {
        openAtomicOperationFormState = state;
    };
    const closeAtomicOperationForm = () => setOpenAtomicOperationForm(false);
</script>

<div class="flex gap-2 w-full">
    {#each Object.entries(atomicOperationActions) as [name, operation] (name)}
        <Button
            class="gap-1 flex-1 {operation.borderClass}"
            size="sm"
            variant="outline"
            onclick={() => {
                selectedOperation = name;
                openAtomicOperationFormState = true;
            }}
        >
            {name}
            <operation.icon class="size-4" />
        </Button>
    {/each}
</div>

<Dialog.Root bind:open={getOpenAtomicOperationForm, setOpenAtomicOperationForm}>
    <Dialog.Content
        class="w-fit bg-transparent border-0 py-0 px-2 shadow-none!"
        showCloseButton={false}
    >
        {#if selectedOperation === "set"}
            <SetAtomicOperationForm close={closeAtomicOperationForm} />
        {:else if selectedOperation === "check"}
            <CheckAtomicOperationForm close={closeAtomicOperationForm} />
        {:else if selectedOperation === "sum"}
            <SumAtomicOperationForm close={closeAtomicOperationForm} />
        {:else if selectedOperation === "min"}
            <MinAtomicOperationForm close={closeAtomicOperationForm} />
        {:else if selectedOperation === "max"}
            <MaxAtomicOperationForm close={closeAtomicOperationForm} />
        {:else if selectedOperation === "delete"}
            <DeleteAtomicOperationForm close={closeAtomicOperationForm} />
        {:else if selectedOperation === "enqueue"}
            <EnqueueAtomicOperationForm close={closeAtomicOperationForm} />
        {/if}
    </Dialog.Content>
</Dialog.Root>

<script lang="ts">
    import type { CodeJar } from "codejar";
    import KvKeyEditor from "../entry-editor/KvKeyEditor.svelte";
    import Button from "$lib/ui/shadcn/button/button.svelte";
    import XIcon from "@lucide/svelte/icons/x";
    import TrashIcon from "@lucide/svelte/icons/trash";
    import { addAtomicOperation } from "./atomicOperationsState.svelte";
    import { toast } from "svelte-sonner";
    import Separator from "$lib/ui/shadcn/separator/separator.svelte";
    import PlusIcon from "@lucide/svelte/icons/plus";

    let { close }: { close?: () => void } = $props();

    let kvKeyEditorRef: CodeJar | undefined = $state();

    async function addDeleteOperation() {
        const key = kvKeyEditorRef?.toString()?.trim();
        if (!key) {
            toast.warning("You need to provide a key to delete");
            return;
        }
        addAtomicOperation({ name: "delete", key });
        close?.();
    }
</script>

<div class="sm:w-xl w-md bg-background p-3 space-y-3 rounded-lg">
    <div class="space-y-1">
        <h1 class="text-2xl font-bold flex gap-2 items-center">
            <TrashIcon class="size-7" />
            Delete Operation
        </h1>
        <p class="text-muted-foreground">
            Delete a key-value entry from the KV store.
        </p>
    </div>
    <Separator />
    <KvKeyEditor editorId="delete-key-editor" bind:jar={kvKeyEditorRef} />
    <div class="flex gap-2 flex-row-reverse">
        <Button size="sm" onclick={addDeleteOperation}>
            Add Delete Operation
            <PlusIcon class="size-4.5" />
        </Button>
        <Button size="sm" variant="outline" onclick={close}>
            Cancel
            <XIcon class="size-4.5" />
        </Button>
    </div>
</div>

<script lang="ts">
    import type { CodeJar } from "codejar";
    import KvKeyEditor from "../entry-editor/KvKeyEditor.svelte";
    import Button from "$lib/ui/shadcn/button/button.svelte";
    import TagIcon from "@lucide/svelte/icons/tag";
    import Input from "$lib/ui/shadcn/input/input.svelte";
    import LockIcon from "@lucide/svelte/icons/lock-keyhole";
    import XIcon from "@lucide/svelte/icons/x";
    import { addAtomicOperation } from "./atomicOperationsState.svelte";
    import { toast } from "svelte-sonner";
    import Separator from "$lib/ui/shadcn/separator/separator.svelte";

    let { close }: { close?: () => void } = $props();

    let kvKeyEditorRef: CodeJar | undefined = $state();
    let versionstampValue = $state("");

    async function addCheckOperation() {
        const key = kvKeyEditorRef?.toString();
        if (!key) {
            toast.warning("You need to provide a key to check");
            return;
        }

        addAtomicOperation({
            name: "check",
            key,
            versionstamp: versionstampValue || null,
        });
        close?.();
    }
</script>

<div class="sm:w-xl w-md bg-background p-3 space-y-3 rounded-lg">
    <h1 class="text-2xl font-bold flex gap-2 items-center">
        <LockIcon class="size-7" />
        Check Operation
    </h1>
    <p class="text-muted-foreground">
        Add to the operation a check that ensures that the versionstamp of the
        key-value entry in the KV store matches the given versionstamp. If the
        check fails, the entire operation will fail and no mutations will be
        performed.
    </p>
    <Separator />
    <KvKeyEditor editorId="check-key-editor" bind:jar={kvKeyEditorRef} />
    <div class="space-y-1.5">
        <p class="flex gap-2 items-center font-bold text-lg">
            <TagIcon /> Versionstamp
            <span
                class="text-base flex items-center text-muted-foreground font-medium"
            >
                (<span>default:</span>
                <code
                    class="ms-1 font-mono bg-muted px-1 rounded text-foreground"
                >
                    null
                </code>)
            </span>
        </p>
        <Input
            bind:value={versionstampValue}
            type="text"
            placeholder="00000000000000000000"
        />
    </div>
    <div class="flex gap-2 flex-row-reverse">
        <Button size="sm" onclick={addCheckOperation}>
            Add Check
            <LockIcon class="size-4.5" />
        </Button>
        <Button size="sm" variant="outline" onclick={close}>
            Cancel
            <XIcon class="size-4.5" />
        </Button>
    </div>
</div>

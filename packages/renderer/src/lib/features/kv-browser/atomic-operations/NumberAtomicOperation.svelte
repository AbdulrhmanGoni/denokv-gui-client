<script lang="ts">
    import Button from "$lib/ui/shadcn/button/button.svelte";
    import Input from "$lib/ui/shadcn/input/input.svelte";
    import XIcon from "@lucide/svelte/icons/x";
    import type { Component, Snippet } from "svelte";
    import { addAtomicOperation } from "./atomicOperationsState.svelte";
    import { toast } from "svelte-sonner";
    import CodeEditor from "../entry-editor/CodeEditor.svelte";
    import KeyFileIcon from "@lucide/svelte/icons/file-key";
    import FileDigitIcon from "@lucide/svelte/icons/file-digit";
    import Separator from "$lib/ui/shadcn/separator/separator.svelte";

    let {
        close,
        operationName,
        Icon,
        description,
    }: {
        close?: () => void;
        operationName: "sum" | "min" | "max";
        Icon: Component;
        description: Snippet;
    } = $props();

    let editorValue = $state("[]");
    let numberValue: number | null = $state(null);

    async function addOperation() {
        const key = editorValue.trim();
        if (!key) {
            toast.warning("You need to provide a key to " + operationName);
            return;
        }

        if (numberValue === null) {
            toast.warning("You need to provide a value to " + operationName);
            return;
        }

        addAtomicOperation({
            name: operationName,
            key,
            value: numberValue,
        });
        close?.();
    }

    let title = $derived(
        operationName[0].toUpperCase() + operationName.substring(1),
    );
</script>

<div class="sm:w-xl w-md bg-background p-3 space-y-3 rounded-lg">
    <h1 class="text-2xl font-bold flex gap-2 items-center">
        <Icon class="size-7" />
        {title} Operation
    </h1>
    {@render description()}
    <Separator />
    <div class="space-y-3">
        <p class="flex gap-2 items-center font-bold text-lg">
            <KeyFileIcon /> Key
        </p>
        <CodeEditor editorId="{operationName}-key-editor" bind:editorValue />
    </div>
    <div class="space-y-1.5">
        <p class="flex gap-2 items-center font-bold text-lg">
            <FileDigitIcon class="size-5.5" />
            Value
        </p>
        <Input
            id="{operationName}-value-input"
            bind:value={numberValue}
            type="number"
            placeholder="0"
        />
    </div>
    <div class="flex gap-2 flex-row-reverse">
        <Button size="sm" onclick={addOperation}>
            Add {title}
            <Icon class="size-4.5" />
        </Button>
        <Button size="sm" variant="outline" onclick={close}>
            Cancel
            <XIcon class="size-4.5" />
        </Button>
    </div>
</div>

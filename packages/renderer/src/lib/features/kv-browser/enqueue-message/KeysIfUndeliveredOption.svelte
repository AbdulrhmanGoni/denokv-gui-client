<script lang="ts">
    import CodeEditor from "../entry-editor/CodeEditor.svelte";
    import * as Dialog from "$lib/ui/shadcn/dialog/index.js";
    import CodeRenderer from "../entry-renderer/CodeRenderer.svelte";
    import EditIcon from "@lucide/svelte/icons/pencil-line";
    import Button from "$lib/ui/shadcn/button/button.svelte";
    import CheckIcon from "@lucide/svelte/icons/square-check-big";
    import RotateCWIcon from "@lucide/svelte/icons/rotate-cw";
    import type { CodeJar } from "codejar";
    import { toast } from "svelte-sonner";
    import PLink from "$lib/ui/primitives/PLink.svelte";

    let {
        value = $bindable(),
        editorRef = $bindable(),
    }: {
        value: string;
        editorRef?: CodeJar;
    } = $props();

    const currentValue = $derived(value);
    let editorValue = $state(value);
    let openForm = $state(false);

    function getOpen() {
        return openForm;
    }

    function setOpen(newOpen: boolean) {
        openForm = newOpen;
    }

    function onSet() {
        try {
            const parsed = eval(editorValue);
            if (
                Array.isArray(parsed) &&
                parsed.every((key) => Array.isArray(key))
            ) {
                value = editorValue;
                setOpen(false);
                return;
            }
        } catch {}

        toast.error(
            "Invalid keys if undelivered, must be an array of arrays where each array is a valid Deno Kv Key",
        );
    }

    function clearEditor() {
        editorValue = "[]";
        editorRef?.updateCode(editorValue);
    }
</script>

<div class="flex gap-1 bg-card rounded-sm overflow-auto items-center">
    <p class="font-semibold px-2 py-1 bg-muted rounded-sm rounded-r-none flex">
        Keys If Undelivered?:
    </p>
    <div class="flex-1 w-50 overflow-auto">
        <CodeRenderer code={currentValue} />
    </div>
    <Button
        size="icon"
        variant="ghost"
        onclick={() => {
            setOpen(true);
        }}
    >
        <EditIcon />
    </Button>
</div>

<Dialog.Root bind:open={getOpen, setOpen}>
    <Dialog.Content
        class="max-w-xl w-full max-h-[600px] overflow-auto p-4 gap-2"
    >
        <div class="space-y-2">
            <p class="text-xl font-semibold">Keys If Undelivered</p>
            <p class="text-sm text-muted-foreground ms-1">
                Set keys to save the message value with when failing to deliver
                the message to the queue.
                <PLink
                    href="https://docs.deno.com/api/deno/~/Deno.Kv.prototype.enqueue#:~:text=keysIfUndelivered%20option"
                >
                    See the API reference
                </PLink> for further details.
            </p>
            <CodeEditor
                editorId="keys-if-undelivered-editor"
                bind:editorValue
                bind:jar={editorRef}
                autoFormat={false}
            />
            <div class="flex gap-2 flex-row-reverse">
                <Button size="sm" onclick={onSet}>
                    Set Option
                    <CheckIcon />
                </Button>
                <Button size="sm" variant="outline" onclick={clearEditor}>
                    Reset
                    <RotateCWIcon />
                </Button>
            </div>
        </div>
    </Dialog.Content>
</Dialog.Root>

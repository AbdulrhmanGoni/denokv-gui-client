<script lang="ts">
    import CodeEditor from "../entry-editor/CodeEditor.svelte";
    import { toast } from "svelte-sonner";
    import * as Dialog from "$lib/ui/shadcn/dialog/index.js";
    import CodeRenderer from "../entry-renderer/CodeRenderer.svelte";
    import EditIcon from "@lucide/svelte/icons/pencil-line";
    import Button from "$lib/ui/shadcn/button/button.svelte";
    import CheckIcon from "@lucide/svelte/icons/square-check-big";
    import UndoIcon from "@lucide/svelte/icons/undo-2";
    import type { CodeJar } from "codejar";
    import PLink from "$lib/ui/primitives/PLink.svelte";

    let {
        value = $bindable(),
        editorRef = $bindable(),
    }: {
        value: number[];
        editorRef?: CodeJar;
    } = $props();

    const currentValue = $derived(JSON.stringify(value));
    let editorValue = $state(JSON.stringify(value));
    let openForm = $state(false);

    function getOpen() {
        return openForm;
    }

    function setOpen(newOpen: boolean) {
        openForm = newOpen;
    }

    function onSet() {
        try {
            const newValue = eval(editorValue);
            if (
                Array.isArray(newValue) &&
                newValue.every((v) => typeof v == "number")
            ) {
                value = newValue;
                setOpen(false);
                return;
            }
        } catch {}

        toast.error(
            "Invalid backoff schedule, must be an array of numbers only",
        );
    }

    function clearEditor() {
        editorValue = "[]";
        editorRef?.updateCode(editorValue);
    }
</script>

<div class="flex gap-1 bg-card rounded-sm overflow-auto items-center">
    <p class="font-semibold px-2 py-1 bg-muted rounded-sm rounded-r-none flex">
        Backoff Schedule?:
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
        class="max-w-xl! w-full max-h-[600px]! overflow-auto p-4 gap-2"
    >
        <div class="space-y-2 overflow-auto">
            <p class="text-xl font-semibold">Backoff Schedule</p>
            <p class="text-sm text-muted-foreground">
                An array of numbers (in milliseconds) that specify the retry
                policy for failed message delivery.
                <PLink
                    href="https://docs.deno.com/api/deno/~/Deno.Kv.prototype.enqueue#:~:text=backoffSchedule%20option"
                >
                    See the API reference
                </PLink> for further details and an example.
            </p>
            <CodeEditor
                editorId="backoff-schedule-editor"
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
                    <UndoIcon />
                </Button>
            </div>
        </div>
    </Dialog.Content>
</Dialog.Root>

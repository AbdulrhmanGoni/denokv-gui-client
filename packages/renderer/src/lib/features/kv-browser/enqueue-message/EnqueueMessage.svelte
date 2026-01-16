<script lang="ts">
    import Separator from "$lib/ui/shadcn/separator/separator.svelte";
    import MessageSquarePlusIcon from "@lucide/svelte/icons/message-square-plus";
    import MessageSquareCodeIcon from "@lucide/svelte/icons/message-square-code";
    import MessageSquareShareIcon from "@lucide/svelte/icons/message-square-share";
    import * as Dialog from "$lib/ui/shadcn/dialog/index.js";
    import { cn } from "$lib/shadcn-utils";
    import { buttonVariants } from "$lib/ui/shadcn/button";
    import KvValueEditor from "../entry-editor/KvValueEditor.svelte";
    import Button from "$lib/ui/shadcn/button/button.svelte";
    import { kvClient } from "@app/preload";
    import { toast } from "svelte-sonner";
    import BackoffSchedule from "./BackoffScheduleOption.svelte";
    import KeysIfUndeliveredOption from "./KeysIfUndeliveredOption.svelte";
    import DelayOption from "./DelayOption.svelte";
    import type { CodeJar } from "codejar";
    import UndoIcon from "@lucide/svelte/icons/undo-2";
    import LoaderIcon from "@lucide/svelte/icons/loader";
    import { dataTypes } from "../utils/dataTypes";

    const defaultValue = { type: "Object", data: "{}" };
    let editorValue: KvEntry["value"] = $state(defaultValue);
    let editorValueRef: CodeJar | undefined = $state();
    let delayOption = $state(0);
    let backoffScheduleOptionValue = $state<number[]>([]);
    let backoffScheduleEditorRef: CodeJar | undefined = $state();
    let keysIfUndeliveredOption = $state<string>("[]");
    let keysIfUndeliveredEditorRef: CodeJar | undefined = $state();
    let isEnqueuing = $state(false);
    let isDialogOpen = $state(false);

    function reset() {
        editorValue.data = dataTypes.find(
            (dt) => editorValue?.type == dt.type,
        )!.starter;
        editorValueRef?.updateCode(editorValue.data);
        delayOption = 0;
        backoffScheduleOptionValue = [];
        backoffScheduleEditorRef?.updateCode("[]");
        keysIfUndeliveredOption = "[]";
        keysIfUndeliveredEditorRef?.updateCode("[]");
    }

    async function enqueue() {
        isEnqueuing = true;

        const options = {
            backoffSchedule: backoffScheduleOptionValue,
            delay: delayOption,
            keysIfUndelivered: keysIfUndeliveredOption,
        };
        const { error } = await kvClient.enqueue(
            $state.snapshot(editorValue),
            $state.snapshot(options),
        );

        if (error) {
            toast.error("Failed to enqueue message", { description: error });
        } else {
            toast.success("Message enqueued successfully");
            reset();
        }

        isEnqueuing = false;
    }

    function getOpen() {
        return isDialogOpen;
    }

    function setOpen(newState: boolean) {
        isDialogOpen = newState;
    }
</script>

<Dialog.Root bind:open={getOpen, setOpen}>
    <Dialog.Trigger
        class={cn(
            buttonVariants({
                size: "sm",
                variant: "secondary",
            }),
        )}
    >
        Enqueue Message
        <MessageSquarePlusIcon class="size-4" />
    </Dialog.Trigger>
    <Dialog.Content
        class="max-w-2xl! w-full max-h-[600px]! overflow-auto p-3 gap-2"
    >
        <div class="flex flex-col gap-3">
            <div class="space-y-1.5">
                <h1 class="text-2xl font-bold flex gap-2 items-center">
                    <MessageSquarePlusIcon class="size-6" />
                    Enqueue Message
                </h1>
                <p>
                    Enqueue a message into your Deno KV Database's
                    <strong>Queue</strong>. <br /> See the official
                    <a
                        href="https://docs.deno.com/deploy/classic/queues/"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="underline text-blue-500"
                    >
                        Deno KV Queues Documentation
                    </a> for more information.
                </p>
            </div>
            <Separator />
            <KvValueEditor
                title="Message"
                {defaultValue}
                bind:editorValue
                {titleIcon}
                bind:jar={editorValueRef}
            />
            <Separator />
            <div class="space-y-1">
                <BackoffSchedule
                    bind:editorRef={backoffScheduleEditorRef}
                    bind:value={backoffScheduleOptionValue}
                />
                <KeysIfUndeliveredOption
                    bind:editorRef={keysIfUndeliveredEditorRef}
                    bind:value={keysIfUndeliveredOption}
                />
            </div>
            <div class="flex flex-row-reverse gap-2">
                <Button
                    disabled={isEnqueuing}
                    variant="secondary"
                    size="sm"
                    onclick={enqueue}
                >
                    Enqueue
                    {#if isEnqueuing}
                        <LoaderIcon class="size-4 animate-spin" />
                    {:else}
                        <MessageSquareShareIcon />
                    {/if}
                </Button>
                <Button
                    disabled={isEnqueuing}
                    class="ms-auto"
                    variant="outline"
                    size="sm"
                    onclick={reset}
                >
                    Reset
                    <UndoIcon />
                </Button>
                <DelayOption bind:value={delayOption} />
            </div>
        </div>
    </Dialog.Content>
</Dialog.Root>

{#snippet titleIcon()}
    <MessageSquareCodeIcon class="text-foreground size-5" />
{/snippet}

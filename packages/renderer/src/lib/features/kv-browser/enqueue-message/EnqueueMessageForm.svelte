<script lang="ts">
    import Separator from "$lib/ui/shadcn/separator/separator.svelte";
    import MessageSquarePlusIcon from "@lucide/svelte/icons/message-square-plus";
    import MessageSquareCodeIcon from "@lucide/svelte/icons/message-square-code";
    import MessageSquareShareIcon from "@lucide/svelte/icons/message-square-share";
    import KvValueEditor from "../entry-editor/KvValueEditor.svelte";
    import Button from "$lib/ui/shadcn/button/button.svelte";
    import BackoffSchedule from "./BackoffScheduleOption.svelte";
    import KeysIfUndeliveredOption from "./KeysIfUndeliveredOption.svelte";
    import DelayOption from "./DelayOption.svelte";
    import type { CodeJar } from "codejar";
    import RotateCWIcon from "@lucide/svelte/icons/rotate-cw";
    import LoaderIcon from "@lucide/svelte/icons/loader";
    import { dataTypes } from "../utils/dataTypes";
    import PLink from "$lib/ui/primitives/PLink.svelte";

    type EnqueueMessageFormProps = {
        onSubmit: (
            message: KvEntry["value"],
            options?: EnqueueRequestInput["options"],
            reset?: () => void,
        ) => Promise<void> | void;
        editorValueRef?: CodeJar;
        keysIfUndeliveredEditorRef?: CodeJar;
        backoffScheduleEditorRef?: CodeJar;
        loading?: boolean;
        submitButtonText?: string;
    };

    let {
        editorValueRef = $bindable(),
        keysIfUndeliveredEditorRef = $bindable(),
        backoffScheduleEditorRef = $bindable(),
        ...props
    }: EnqueueMessageFormProps = $props();

    const defaultValue = { type: "Object", data: "{}" };
    let editorValue: KvEntry["value"] = $state(defaultValue);
    let delayOption = $state(0);
    let backoffScheduleOptionValue = $state<number[]>([]);
    let keysIfUndeliveredOption = $state<string>("[]");

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

    function enqueue() {
        const options = {
            backoffSchedule: backoffScheduleOptionValue,
            delay: delayOption,
            keysIfUndelivered: keysIfUndeliveredOption,
        };

        props.onSubmit($state.snapshot(editorValue), $state.snapshot(options));
    }
</script>

<div class="flex flex-col gap-3">
    <div class="space-y-1.5">
        <h1 class="text-2xl font-bold flex gap-2 items-center">
            <MessageSquarePlusIcon class="size-6" />
            Enqueue Message
        </h1>
        <p>
            Enqueue a message into your Deno KV Database's
            <strong>Queue</strong>. <br /> See the official
            <PLink href="https://docs.deno.com/deploy/classic/queues/">
                Deno KV Queues Documentation
            </PLink> for more information.
        </p>
    </div>
    <Separator />
    <KvValueEditor
        title="Message Value"
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
            disabled={props.loading}
            variant="secondary"
            size="sm"
            onclick={enqueue}
        >
            {props.submitButtonText ?? "Enqueue"}
            {#if props.loading}
                <LoaderIcon class="size-4 animate-spin" />
            {:else}
                <MessageSquareShareIcon />
            {/if}
        </Button>
        <Button
            disabled={props.loading}
            class="ms-auto"
            variant="outline"
            size="sm"
            onclick={reset}
        >
            Reset
            <RotateCWIcon />
        </Button>
        <DelayOption bind:value={delayOption} />
    </div>
</div>

{#snippet titleIcon()}
    <MessageSquareCodeIcon class="text-foreground size-5" />
{/snippet}
